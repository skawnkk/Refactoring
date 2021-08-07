import { plays } from './plays.js';
import { invoice } from './invoice.js';

function statement(invoice, plays) {
  let totalAmount = 0;
  let result = `청구내역 (고객명: ${invoice.customer})\n`;

  for (let perf of invoice.performances) {
    result += `  ${playFor(perf).name}: ${usd(amountFor(perf))}  (${perf.audience}석)\n`;
    totalAmount += amountFor(perf);
  }
  result += `총액: ${usd(totalAmount)}\n`;
  result += `적립 포인트: ${totalVolumeCredits()}점\n`;
  return result;
}

function totalVolumeCredits() {
  let volumeCredits = 0; //포인트(다음 공연 의뢰시 할인)
  for (let perf of invoice.performances) {
    volumeCredits += volumCreditsFor(perf);
  }
  return volumeCredits;
}

function usd(number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(
    number / 100
  );
}

function volumCreditsFor(performance) {
  let result = 0;
  result += Math.max(performance.audience - 30, 0);
  if ('comedy' === playFor(performance).type) result += Math.floor(performance.audience / 5);
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
