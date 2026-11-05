const db = require('../../models');

const semesterRows = ({ id, startYear, endYear }) => {
  if (!Number.isInteger(startYear) || !Number.isInteger(endYear)
      || startYear < 1900 || endYear > 2200 || endYear <= startYear) return [];
  const rows = [];
  for (let year = startYear; year < endYear; year += 1) {
    for (const code of [1, 2]) rows.push({ trainingClassId: id, schoolYear: `${year}-${year + 1}`, code });
  }
  return rows;
};

const ensureDefaultSemesters = async (trainingClass, transaction) => {
  const rows = semesterRows(trainingClass);
  if (rows.length) await db.trainingClassSemester.bulkCreate(rows, { transaction, ignoreDuplicates: true });
};

module.exports = { semesterRows, ensureDefaultSemesters };
