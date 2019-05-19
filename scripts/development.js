require('dotenv').config();

const getContracts = require('./../src/utils/getContracts');
var FileAPI = require('file-api')
  , File = FileAPI.File
  , FileList = FileAPI.FileList
  , FileReader = FileAPI.FileReader
  ;

// skale file storage
const Filestorage = require('@skalenetwork/filestorage.js/src/index');
let filestorage = new Filestorage(process.env.SKALE_URL);

// let's say every token will be worth 10 cents when asset is first fractionalized
const VALUE_PER_TOKEN_USD_CENTS = 10;

function calculateProjectedProfit(value, annualizedROI, timeframeMonths = 12) {
  return (value * (annualizedROI / 100)) * (timeframeMonths / 12);
}

async function uploadFile(account, filePath, fileName) {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();

    reader.onerror = reject;

    reader.onload = async function(e) {
      const arrayBuffer = reader.result
      const bytes = new Uint8Array(arrayBuffer);
      let link = filestorage.uploadFile(
        account,
        fileName,
        bytes,
        "bd5777ff8b5b036c45370685da4808e2ea05a28b1032442e3781bf88777e9ef0" // for these test assets, just use master key
      );

      resolve(link);
    };

    reader.readAsArrayBuffer(new File(filePath));
  });
}

async function downloadFile(link) {
  let file = await filestorage.downloadToBuffer(link);
  file = 'data:image/png;base64,' + file.toString('base64');
  console.log(file);
}

async function addAsset1(contracts) {
  let ASSET_NAME = "20 Water St New York NY";
  let VALUE_USD = 100000; // let them all be 100k by default
  let CAP = VALUE_USD / VALUE_PER_TOKEN_USD_CENTS;
  let ANNUALIZED_ROI = 15; // %
  let TIMEFRAME_MONTHS = 12;

  // upload file to skale
  let link = await uploadFile(contracts.accounts[0], 'src/assets/asset1.jpeg', 'asset1'); // @TODO hash filename

  let asset1 = [
    ASSET_NAME,
    VALUE_USD,
    CAP,
    ANNUALIZED_ROI,
    (VALUE_USD + calculateProjectedProfit(VALUE_USD, ANNUALIZED_ROI, TIMEFRAME_MONTHS)),
    TIMEFRAME_MONTHS,
    VALUE_PER_TOKEN_USD_CENTS,
    link
  ];

  // add asset
  console.log('adding test assets...');
  const result = await contracts.assetRegistry.addAsset(contracts.accounts[0], ...asset1, { from: contracts.accounts[0] });
  const log = result.logs.filter((log) => { return log.event === 'AssetRecordCreated' } );
  const id = log.length ? log[0].args.id.toNumber() : null;
  console.log(`added record, id: ${id}`);

  const record = await contracts.assetRegistry.getAssetById(id);
  console.log(record);
}

async function addAsset2(contracts) {
  let ASSET_NAME = "30 Gold St New York NY";
  let VALUE_USD = 100000; // let them all be 100k by default
  let CAP = VALUE_USD / VALUE_PER_TOKEN_USD_CENTS;
  let ANNUALIZED_ROI = 15; // %
  let TIMEFRAME_MONTHS = 12;

  // upload file to skale
  let link = await uploadFile(contracts.accounts[0], 'src/assets/asset2.jpg', 'asset2'); // @TODO hash filename

  let asset1 = [
    ASSET_NAME,
    VALUE_USD,
    CAP,
    ANNUALIZED_ROI,
    (VALUE_USD + calculateProjectedProfit(VALUE_USD, ANNUALIZED_ROI, TIMEFRAME_MONTHS)),
    TIMEFRAME_MONTHS,
    VALUE_PER_TOKEN_USD_CENTS,
    link
  ];

  // add asset
  console.log('adding test assets...');
  const result = await contracts.assetRegistry.addAsset(contracts.accounts[0], ...asset1, { from: contracts.accounts[0] });
  const log = result.logs.filter((log) => { return log.event === 'AssetRecordCreated' } );
  const id = log.length ? log[0].args.id.toNumber() : null;
  console.log(`added record, id: ${id}`);

  const record = await contracts.assetRegistry.getAssetById(id);
  console.log(record);
}

module.exports = async function(callback) {
  console.log('development.js ------');

  try {
    let contracts = await getContracts();
    console.log('initialized contracts');

    // adding assets
    await addAsset1(contracts);
    await addAsset2(contracts);

    // giving away some DAI

    // now some user can click invest()

    // do stuff
    callback();
  } catch(error) {
    console.log(error);
    console.log('see errors --');
    callback();
  }
}
