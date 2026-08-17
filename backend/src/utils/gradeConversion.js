const GRADE_TABLE = {
  'A+': { point4: 4.0, point10: 9.5, min10: 9.5, max10: 10 },
  'A':  { point4: 4.0, point10: 8.5, min10: 8.5, max10: 9.4 },
  'B+': { point4: 3.5, point10: 8.0, min10: 8.0, max10: 8.4 },
  'B':  { point4: 3.0, point10: 7.0, min10: 7.0, max10: 7.9 },
  'C+': { point4: 2.5, point10: 6.5, min10: 6.5, max10: 6.9 },
  'C':  { point4: 2.0, point10: 5.5, min10: 5.5, max10: 6.4 },
  'D+': { point4: 1.5, point10: 5.0, min10: 5.0, max10: 5.4 },
  'D':  { point4: 1.0, point10: 4.0, min10: 4.0, max10: 4.9 },
  'F':  { point4: 0.0, point10: 0.0, min10: 0, max10: 3.9 },
};

const point10ToLetter = (point10) => {
  for (const [letter, range] of Object.entries(GRADE_TABLE)) {
    if (point10 >= range.min10 && point10 <= range.max10) return letter;
  }
  return 'F';
};

const point10ToPoint4 = (point10) => {
  const letter = point10ToLetter(point10);
  return GRADE_TABLE[letter].point4;
};

const point4ToPoint10 = (point4) => {
  for (const [, range] of Object.entries(GRADE_TABLE)) {
    if (range.point4 === point4) return range.point10;
  }
  return 0;
};

const letterToPoint10 = (letter) => {
  return GRADE_TABLE[letter]?.point10 || 0;
};

const letterToPoint4 = (letter) => {
  return GRADE_TABLE[letter]?.point4 || 0;
};

const convertGrade = (value, from, to) => {
  let point10;

  if (from === '10') point10 = parseFloat(value);
  else if (from === '4') point10 = point4ToPoint10(parseFloat(value));
  else if (from === 'letter') point10 = letterToPoint10(value.toUpperCase());
  else return null;

  if (to === '10') return { value: point10, unit: '10' };
  if (to === '4') return { value: point10ToPoint4(point10), unit: '4' };
  if (to === 'letter') return { value: point10ToLetter(point10), unit: 'letter' };

  return null;
};

const convertMultiple = (grades) => {
  return grades.map(g => ({
    input: g,
    output: convertGrade(g.value, g.from, g.to),
  }));
};

const calculateGpa = (grades) => {
  if (!grades.length) return { gpa4: 0, gpa10: 0, totalCredits: 0 };

  let totalPoint4 = 0, totalPoint10 = 0, totalCredits = 0;

  for (const g of grades) {
    const credits = g.credits || 0;
    const point10 = parseFloat(g.point10 || 0);
    const point4 = point10ToPoint4(point10);

    totalPoint4 += point4 * credits;
    totalPoint10 += point10 * credits;
    totalCredits += credits;
  }

  return {
    gpa4: totalCredits ? (totalPoint4 / totalCredits).toFixed(2) : 0,
    gpa10: totalCredits ? (totalPoint10 / totalCredits).toFixed(2) : 0,
    totalCredits,
  };
};

const getGradeTable = () => {
  return Object.entries(GRADE_TABLE).map(([letter, range]) => ({
    letter,
    point4: range.point4,
    point10: range.point10,
    range10: `${range.min10} - ${range.max10}`,
  }));
};

module.exports = {
  convertGrade,
  convertMultiple,
  calculateGpa,
  getGradeTable,
};
