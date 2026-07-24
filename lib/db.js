import fs from 'fs';
import path from 'path';

const membersPath = path.join(process.cwd(), 'data', 'members.json');
const financialsPath = path.join(process.cwd(), 'data', 'financials.json');

export function getMembersData() {
  try {
    const fileContent = fs.readFileSync(membersPath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Error reading members.json:', error);
    return [];
  }
}

export function saveMembersData(data) {
  try {
    fs.writeFileSync(membersPath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing members.json:', error);
    return false;
  }
}

export function getFinancialsData() {
  try {
    const fileContent = fs.readFileSync(financialsPath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Error reading financials.json:', error);
    return { payments: [], investments: [], profitLoss: [], notices: [], charity: [] };
  }
}

export function saveFinancialsData(data) {
  try {
    fs.writeFileSync(financialsPath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing financials.json:', error);
    return false;
  }
}
