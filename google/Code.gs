/** Why We Do Physics — Google Sheets backend.
 * Run setupSite() once, then deploy as a Web app: execute as Me, access Anyone.
 * Keep the spreadsheet private. The public site uses only the /exec URL.
 */
const CONSENT = 'yes';
const MAP_PERMISSION = 'yes';
const FLAG_REASONS = ['Inappropriate or harmful content','Spam or unrelated content','Attribution or privacy concern'];
const STAGES = ['Undergraduate','Master’s','PhD','Postdoc','Faculty','Research staff','Industry','Alumni','Independent','Other'];
const CATEGORIES = ['astro-ph','cond-mat','gr-qc','hep-ex','hep-lat','hep-ph','hep-th','math-ph','nucl-ex','nucl-th','physics','quant-ph'];
const RESPONSE_HEADERS = ['Timestamp','Name','Affiliation','Career stage','PhD year','arXiv category','Why do you do physics?','City','Country','Map permission','arXiv identifier (optional)','Display permission','Response ID','Approved','Latitude','Longitude','Map place'];

function setupSite() {
  const props = PropertiesService.getScriptProperties();
  if (props.getProperty('SHEET_ID')) throw new Error('Already configured. Reuse the existing spreadsheet.');
  const ss = SpreadsheetApp.create('Why We Do Physics — responses and moderation');
  const responses = ss.getSheets()[0];
  responses.setName('Responses');
  responses.getRange(1, 1, 1, RESPONSE_HEADERS.length).setValues([RESPONSE_HEADERS]);
  responses.setFrozenRows(1);
  responses.getRange(2, RESPONSE_HEADERS.indexOf('Approved') + 1, Math.max(responses.getMaxRows() - 1, 1), 1).insertCheckboxes();
  ss.insertSheet('Hearts').appendRow(['Response ID','Visitor','Created']);
  ss.insertSheet('Flags').appendRow(['Response ID','Visitor','Reason','Created','Resolved']);
  props.setProperties({SHEET_ID: ss.getId(), RESPONSE_SHEET: responses.getName()});
  console.log('Private moderation sheet: ' + ss.getUrl());
}

function clean(value, max) { return String(value || '').trim().slice(0, max); }
function publicDate(value) { return value instanceof Date && !isNaN(value) ? Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd') : ''; }
function json(value) { return ContentService.createTextOutput(JSON.stringify(value).replace(/</g, '\\u003c')).setMimeType(ContentService.MimeType.JSON); }

function doPost(e) {
  const p = (e && e.parameter) || {};
  let lock;
  try {
    if (p.action !== 'submit' || p.website) throw new Error('Invalid request.');
    const name = clean(p.name, 100), affiliation = clean(p.affiliation, 160);
    const stage = STAGES.includes(p.stage) ? p.stage : '';
    const category = CATEGORIES.includes(p.category) ? p.category : '';
    const year = clean(p.year, 4), reason = clean(p.reason, 140);
    const city = clean(p.city, 120), country = clean(p.country, 120), arxiv = clean(p.arxiv, 200);
    const mapOptIn = p.mapOptIn === MAP_PERMISSION, consent = p.consent === CONSENT;
    if (!name || reason.length < 20 || !consent) throw new Error('Complete the required fields.');
    if (year && !/^(19|20|21)[0-9]{2}$/.test(year)) throw new Error('Check the PhD year.');
    if (mapOptIn && (!city || !country)) throw new Error('Add both city and country for map placement.');
    lock = LockService.getScriptLock();
    if (!lock.tryLock(10000)) throw new Error('The site is busy. Please try again.');
    const props = PropertiesService.getScriptProperties();
    const sheet = SpreadsheetApp.openById(props.getProperty('SHEET_ID')).getSheetByName(props.getProperty('RESPONSE_SHEET'));
    const id = Utilities.getUuid();
    const row = [new Date(), name, affiliation, stage, year, category, reason, city, country, mapOptIn ? MAP_PERMISSION : '', arxiv, consent ? CONSENT : '', id, false, '', '', ''];
    if (mapOptIn) {
      try {
        const result = Maps.newGeocoder().geocode(city + ', ' + country);
        if (result.status === 'OK' && result.results.length) {
          const place = result.results[0];
          row[14] = place.geometry.location.lat;
          row[15] = place.geometry.location.lng;
          row[16] = place.formatted_address;
        }
      } catch (err) { console.log('City geocoding unavailable; coordinates can be added during moderation.'); }
    }
    sheet.appendRow(row);
    return json({ok: true, id: id});
  } catch (err) {
    const safe = ['Invalid request.','Complete the required fields.','Check the PhD year.','Add both city and country for map placement.','The site is busy. Please try again.'];
    return json({ok: false, error: safe.includes(err.message) ? err.message : 'Could not save the response.'});
  } finally { if (lock && lock.hasLock()) lock.releaseLock(); }
}

function doGet(e) {
  const p = e.parameter || {}, callback = p.callback || '';
  if (!/^wallcb[a-f0-9]{32}$/.test(callback)) return json({ok: false, error: 'Invalid callback'});
  let result, lock;
  try {
    if (!/^[a-f0-9-]{36}$/.test(p.visitor || '')) throw new Error('Invalid visitor.');
    lock = LockService.getScriptLock();
    if (!lock.tryLock(10000)) throw new Error('The wall is busy. Please try again.');
    const props = PropertiesService.getScriptProperties(), ss = SpreadsheetApp.openById(props.getProperty('SHEET_ID'));
    const sheet = ss.getSheetByName(props.getProperty('RESPONSE_SHEET'));
    const all = sheet.getDataRange().getValues(), headers = all.shift();
    const column = key => headers.indexOf(key), get = (row, key) => column(key) < 0 ? '' : row[column(key)];
    const eligible = [];
    all.forEach((row, i) => {
      if (get(row, 'Approved') !== true || get(row, 'Display permission') !== CONSENT) return;
      let id = String(get(row, 'Response ID'));
      if (!id) { id = Utilities.getUuid(); sheet.getRange(i + 2, column('Response ID') + 1).setValue(id); }
      const mapOptIn = get(row, 'Map permission') === MAP_PERMISSION;
      eligible.push({id, date: publicDate(get(row, 'Timestamp')), name: clean(get(row, 'Name'), 100), affiliation: clean(get(row, 'Affiliation'), 160), stage: clean(get(row, 'Career stage'), 40), category: clean(get(row, 'arXiv category'), 30), year: clean(get(row, 'PhD year'), 4), reason: clean(get(row, 'Why do you do physics?'), 140), arxiv: clean(get(row, 'arXiv identifier (optional)'), 200), city: mapOptIn ? clean(get(row, 'City'), 120) : '', country: mapOptIn ? clean(get(row, 'Country'), 120) : '', lat: !mapOptIn || get(row, 'Latitude') === '' ? null : Number(get(row, 'Latitude')), lng: !mapOptIn || get(row, 'Longitude') === '' ? null : Number(get(row, 'Longitude'))});
    });
    const heartSheet = ss.getSheetByName('Hearts'), hearts = heartSheet.getDataRange().getValues().slice(1);
    if (p.action === 'wall') {
      const counts = {}, mine = {};
      hearts.forEach(r => { counts[r[0]] = (counts[r[0]] || 0) + 1; if (r[1] === p.visitor) mine[r[0]] = true; });
      result = {ok: true, rows: eligible.map(r => ({...r, hearts: counts[r.id] || 0, liked: !!mine[r.id]}))};
    } else {
      if (!eligible.some(r => r.id === p.id)) throw new Error('This response is no longer on the wall.');
      if (p.action === 'heart') {
        if (!['true','false'].includes(p.liked)) throw new Error('Invalid heart action.');
        const index = hearts.findIndex(r => r[0] === p.id && r[1] === p.visitor);
        if (p.liked === 'true' && index < 0) heartSheet.appendRow([p.id, p.visitor, new Date()]);
        if (p.liked === 'false' && index >= 0) heartSheet.deleteRow(index + 2);
        const count = hearts.filter(r => r[0] === p.id).length + (p.liked === 'true' && index < 0 ? 1 : 0) - (p.liked === 'false' && index >= 0 ? 1 : 0);
        result = {ok: true, hearts: count, liked: p.liked === 'true'};
      } else if (p.action === 'flag') {
        if (!FLAG_REASONS.includes(p.reason)) throw new Error('Choose a report reason.');
        const flagSheet = ss.getSheetByName('Flags'), flags = flagSheet.getDataRange().getValues().slice(1);
        if (!flags.some(r => r[0] === p.id && r[1] === p.visitor)) flagSheet.appendRow([p.id, p.visitor, p.reason, new Date(), false]);
        result = {ok: true};
      } else throw new Error('Unknown action.');
    }
  } catch (err) {
    const safe = ['Invalid visitor.','The wall is busy. Please try again.','This response is no longer on the wall.','Invalid heart action.','Choose a report reason.','Unknown action.'];
    result = {ok: false, error: safe.includes(err.message) ? err.message : 'Could not load the wall.'};
  } finally { if (lock && lock.hasLock()) lock.releaseLock(); }
  return ContentService.createTextOutput(callback + '(' + JSON.stringify(result).replace(/</g, '\\u003c') + ');').setMimeType(ContentService.MimeType.JAVASCRIPT);
}
