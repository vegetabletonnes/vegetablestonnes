/**
 * Formats a long UUID into a 7-character display ID based on a prefix string.
 * Uses the first 3 alphabetical characters of the prefix and the first 4 characters of the UUID.
 * 
 * @param {string} prefixStr - The string to derive the prefix from (e.g. 'Tomato', 'Bulk Buyer').
 * @param {string} uuid - The unique UUID string.
 * @returns {string} The 7-character formatted ID.
 */
export const formatDisplayId = (prefixStr, uuid) => {
  if (!uuid) return 'N/A';
  
  // Extract up to 3 alphabetical characters, uppercase them.
  let prefix = (prefixStr || '').replace(/[^A-Za-z]/g, '').substring(0, 3).toUpperCase();
  
  // If prefix is less than 3 chars (e.g. missing name), pad it with 'X'
  prefix = prefix.padEnd(3, 'X');
  
  // Take first 4 characters of UUID, uppercase them
  const suffix = uuid.replace(/[^A-Za-z0-9]/g, '').substring(0, 4).toUpperCase();
  
  return `${prefix}${suffix}`;
};
