/**
 * Simple EMVCo / DuitNow QR Utility
 * Used to extract Merchant IDs and generate Dynamic QRs with amounts.
 */

interface EMVCoField {
  id: string;
  length: string;
  value: string;
}

export function parseEMVCo(data: string): Record<string, string> {
  const fields: Record<string, string> = {};
  let i = 0;
  while (i < data.length) {
    const id = data.substring(i, i + 2);
    const length = parseInt(data.substring(i + 2, i + 6));
    const value = data.substring(i + 6, i + 6 + length);
    fields[id] = value;
    i += 6 + length;
  }
  return fields;
}

/**
 * Reconstructs a DuitNow string with a specific amount.
 * Field 54 is the amount.
 * Field 53 is the currency (458 for MYR).
 */
export function generateDynamicQR(staticDuitNow: string, amount: number): string {
  // 1. Parse existing fields
  const fields: Record<string, string> = {};
  let i = 0;
  
  // Basic EMVCo parsing loop
  while (i < staticDuitNow.length - 4) { // Subtract 4 for CRC
    const id = staticDuitNow.substring(i, i + 2);
    const lenStr = staticDuitNow.substring(i + 2, i + 4);
    const len = parseInt(lenStr);
    const val = staticDuitNow.substring(i + 4, i + 4 + len);
    fields[id] = val;
    i += 4 + len;
  }

  // 2. Set/Update amount fields
  // 53 = Transaction Currency (458 for Malaysia)
  fields["53"] = "458";
  // 54 = Transaction Amount
  fields["54"] = amount.toFixed(2);
  
  // 3. Reconstruct string (excluding CRC)
  let result = "";
  // Sort IDs to keep it standard
  const keys = Object.keys(fields).sort();
  for (const key of keys) {
    if (key === "63") continue; // Skip old CRC
    const val = fields[key];
    const len = val.length.toString().padStart(2, "0");
    result += key + len + val;
  }

  // 4. Append CRC placeholder
  result += "6304";

  // 5. Calculate CRC16 (CCITT-FALSE)
  const crc = calculateCRC16(result);
  return result + crc;
}

function calculateCRC16(data: string): string {
  let crc = 0xFFFF;
  const polynomial = 0x1021;

  for (let i = 0; i < data.length; i++) {
    const charCode = data.charCodeAt(i);
    crc ^= (charCode << 8);
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ polynomial;
      } else {
        crc <<= 1;
      }
    }
  }
  return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, "0");
}
