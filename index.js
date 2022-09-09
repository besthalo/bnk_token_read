const puppeteer = require("puppeteer");
const BigNumber = require("bignumber.js");
const UserAgent = require("user-agents");
// Example from CGM poll
const eventName = [
  "Angel",
  "Aom",
  "Champoo",
  "Fahsai",
  "Fortune",
  "Jayda",
  "Jjae",
  "Kaiwan",
  "Kaning",
  "Kyla",
  "Latin",
  "Marmink",
  "Meen",
  "Mei",
  "Milk",
  "Nena",
  "Nenie",
  "Parima",
  "Pim",
  "Ping",
  "Punch",
  "Sita",
];

const fractor = new BigNumber("1000000000000000000");
let lastVote = [];
let totalVote = 0;
let previousVote = [];

function getVote(index) {
  return `span > div:nth-child(${2 + 3 * (index + 1)})`;
}

const LinkAddress =
  "https://scan.tokenx.finance/address/0x429B686F70332fd0A3F8d261A11B4B42d6D036Df/read-contract"; // INPUT Link Address

async function processData() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const userAgent = new UserAgent();
  await page.setUserAgent(userAgent.toString());
  await page.goto(LinkAddress);
  await page.$x("//div[contains(text(),'getProposalList')]");
  await page.waitForSelector(getVote(1), { timeout: 60000 });

  for (let index = 0; index < eventName.length; index++) {
    let amount = await page.$(getVote(index));
    let value = await page.evaluate((el) => el.textContent, amount);
    value = value.replace("(uint256) :", "");
    value = new BigNumber(value);
    let voteAmount = value.dividedBy(fractor).toFixed(3);
    lastVote.push({
      name: eventName[index],
      voteAmount: voteAmount
    });
  }
  lastVote.sort((a, b) => {
    return b.voteAmount - a.voteAmount;
  });


  // check diff
  for (const [i, v] of lastVote.entries()) {
    if (i == 0) {
      lastVote[i]["rankDiff"] = "0.000";
      lastVote[i]["diff THB"] = "0.000";
    } else {
      lastVote[i]["rankDiff"] = (
        lastVote[i - 1].voteAmount - lastVote[i].voteAmount
      ).toFixed(3);
      lastVote[i]["diff THB"] = new Intl.NumberFormat().format(
        (lastVote[i]["rankDiff"] * 68).toFixed(3)
      );
    }
  }

  let dataForPrint = {};
  totalVote = 0;
  for (const [i, v] of lastVote.entries()) {
    dataForPrint[i + 1] = v;
    totalVote += new Number(v.voteAmount);
  }
  console.clear();
  console.table(dataForPrint);
  process.exit()
}


(async ()=>{
    await processData()
})();