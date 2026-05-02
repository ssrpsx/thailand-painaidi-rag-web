const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, 'data.csv');
const imgDirPath = path.join(__dirname, '../public/img');
const seedPath = path.join(__dirname, 'seed_places.sql');

const csvData = fs.readFileSync(csvPath, 'utf8');
const rows = csvData.split('\n');
const headers = rows[0].split(',').map(h => h.trim());

// Create a mapping of ATT_NAME_TH to row data
const placesData = [];
for (let i = 1; i < rows.length; i++) {
  const rowStr = rows[i].trim();
  if (!rowStr) continue;

  const row = [];
  let current = '';
  let inQuotes = false;
  for (let char of rowStr) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      row.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  row.push(current);

  if (row.length > 1) {
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = row[idx] ? row[idx].replace(/^"|"$/g, '').trim() : '';
    });
    placesData.push(obj);
  }
}

console.log(`Loaded ${placesData.length} places from CSV`);

const dirs = fs.readdirSync(imgDirPath).filter(f => {
  try {
    return fs.statSync(path.join(imgDirPath, f)).isDirectory();
  } catch (e) {
    return false;
  }
});

let placesValues = [];
let imagesValues = [];

let placeId = 6; // Start after mock data or 1. Let's just start from 6

for (const dir of dirs) {
  // Match folder name with ATT_NAME_TH
  const matchedPlace = placesData.find(p => dir.startsWith(p.ATT_NAME_TH));

  if (matchedPlace) {
    const escape = (str) => {
      if (str === null || str === undefined || str === '') return 'NULL';
      return "'" + str.replace(/'/g, "''") + "'";
    };

    const valStr = `(
      ${placeId},
      ${escape(matchedPlace.ATT_NAME_TH)},
      ${escape(matchedPlace.ATT_NAME_EN)},
      ${escape(matchedPlace.PROVINCE_NAME_TH)},
      ${escape(matchedPlace.REGION_NAME_TH)},
      ${escape(matchedPlace.ATT_CATEGORY_LABEL)},
      ${escape(matchedPlace.ATT_TYPE_LABEL)},
      ${escape(matchedPlace.ATT_ADDRESS)},
      ${escape(matchedPlace.DISTRICT_NAME_TH)},
      ${escape(matchedPlace.SUBDISTRICT_NAME_TH)},
      ${escape(matchedPlace.ATT_ADDRESS_ROAD)},
      ${escape(matchedPlace.ATT_ADDRESS_ALLEY)},
      ${escape(matchedPlace.ATT_DETAIL_TH)},
      ${escape(matchedPlace.ATT_ACTIVITY)},
      ${escape(matchedPlace.ATT_SUITABLE_DURATION)},
      ${escape(matchedPlace.ATT_START_END)},
      ${escape(matchedPlace.ATT_FEE_TH)},
      ${escape(matchedPlace.ATT_FEE_TH_KID)},
      ${escape(matchedPlace.ATT_FEE_EN)},
      ${escape(matchedPlace.ATT_FEE_EN_KID)},
      ${escape(matchedPlace.ATT_TEL)},
      ${escape(matchedPlace.ATT_EMAIL)},
      ${escape(matchedPlace.ATT_WEBSITE)},
      ${escape(matchedPlace.ATT_FACEBOOK)},
      ${escape(matchedPlace.ATT_INSTAGRAM)},
      ${escape(matchedPlace.ATT_LINE)},
      ${escape(matchedPlace.ATT_TIKTOK)},
      ${escape(matchedPlace.ATT_YOUTUBE)},
      ${escape(matchedPlace.ATT_FACILITIES_CONTACT)},
      ${escape(matchedPlace.ATT_NEARBY_LOCATION)},
      ${escape(matchedPlace.ATT_REMARK)},
      ${escape(matchedPlace.ATT_LOCATION)}
    )`;

    placesValues.push(valStr);

    // Read images
    const images = fs.readdirSync(path.join(imgDirPath, dir)).filter(f => f.toLowerCase().endsWith('.jpg') || f.toLowerCase().endsWith('.png') || f.toLowerCase().endsWith('.jpeg'));
    images.forEach((img, idx) => {
      const imgUrl = `/img/${dir}/${img}`; // Using literal path, standard approach
      imagesValues.push(`(${placeId}, ${escape(imgUrl)}, ${idx})`);
    });

    placeId++;
  } else {
    // console.log("Not matched:", dir);
  }
}

console.log(`Matched ${placesValues.length} folders and generated ${imagesValues.length} images`);

let seedContent = "SET NAMES utf8mb4;\nSET CHARACTER SET utf8mb4;\n";

if (placesValues.length > 0) {
  let placesQuery = `\nINSERT INTO \`places\` (\`id\`, \`name_th\`, \`name_en\`, \`province\`, \`region\`, \`type\`, \`subtype\`, \`address\`, \`district\`, \`subdistrict\`, \`road\`, \`soi\`, \`description\`, \`activities\`, \`best_time\`, \`opening_hours\`, \`fee_thai_adult\`, \`fee_thai_child\`, \`fee_foreign_adult\`, \`fee_foreign_child\`, \`phone\`, \`email\`, \`website\`, \`facebook\`, \`instagram\`, \`line\`, \`tiktok\`, \`youtube\`, \`contact_info\`, \`nearby\`, \`notes\`, \`coords\`) VALUES\n`;
  placesQuery += placesValues.join(',\n') + ';\n';

  seedContent += placesQuery;
}

if (imagesValues.length > 0) {
  let imagesQuery = `\nINSERT INTO \`images\` (\`place_id\`, \`image_url\`, \`sort_order\`) VALUES\n`;
  imagesQuery += imagesValues.join(',\n') + ';\n';

  seedContent += imagesQuery;
}

fs.writeFileSync(seedPath, seedContent);
console.log('Appended to seed_places.sql successfully!');
