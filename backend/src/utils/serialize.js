const toCamelCase = (str) =>
  str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

const serialize = (value) => {
  if (value === null || value === undefined) return value;
  if (value instanceof Date) return value;
  if (Array.isArray(value)) return value.map((item) => serialize(item));

  if (typeof value === 'object') {
    // Nếu là Sequelize instance, lấy plain object
    const plain =
      typeof value.get === 'function' ? value.get({ plain: true }) : value;

    const result = {};
    for (const [key, val] of Object.entries(plain)) {
      if (key === 'password') continue;

      let newKey = key;
      if (/^[A-Z]/.test(key)) {
        // PascalCase (tên model khi include) -> camelCase
        newKey = key.charAt(0).toLowerCase() + key.slice(1);
      } else if (key.includes('_')) {
        newKey = toCamelCase(key);
      }

      result[newKey] = serialize(val);
    }
    return result;
  }

  return value;
};

module.exports = { serialize };
