import { plays } from './plays.js';
import { invoice } from './invoice.js';

function statement(invoice, plays) {
  let totalAmount = 0;
  let volumeCredits = 0; //포인트(다음 공연 의뢰시 할인)
  let result = `청구내역 (고객명: ${invoice.customer})\n`;
  const format = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })
    .format;
  for (let perf of invoice.performances) {
    //함수로 추출하고 인라인으로 적용할 예정(perf와 plays를 참조하여 나온 결과로 매개변수를 따로 둘필요없다.)
    let thisAmount = amountFor(perf);

    volumeCredits += Math.max(perf.audience - 30, 0);
    if ('comedy' === playFor(perf).type) volumeCredits += Math.floor(perf.audience / 5);

    result += `  ${playFor(perf).name}: ${format(thisAmount / 100)}  (${perf.audience}석)\n`;
    totalAmount += thisAmount;
  }
  result += `총액: ${format(totalAmount / 100)}\n`;
  result += `적립 포인트: ${volumeCredits}점\n`;
  return result;
}

function playFor(performance) {
  return plays[performance.playID];
}

function amountFor(performance) {
  let result = 0;
  switch (playFor(performance).type) {
    case 'tragedy':
      result = 40000;
      if (performance.audience > 30) {
        result += 1000 * (performance.audience - 30);
      }
      break;
    case 'comedy':
      result = 30000;
      if (performance.audience > 20) {
        result += 10000 + 500 * (performance.audience - 20);
      }
      result += 300 * performance.audience;
      break;
    default:
      throw new Error(`알 수 없는 장르: ${playFor(performance).type}`);
  }
  return result;
}
console.log(statement(invoice, plays));
