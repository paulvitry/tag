/**
 * Format a RfID from QrCode and check CFRC
 * throws Error if CRC is invalid
 *
 * @param RfID RfID to format from QR code
 * @returns formated RfID
 */
const FormatRfID = (RfID: string): string => {
  const error = new Error('Invalid tag');

  RfID = RfID.padStart(24, '0');
  if (RfID.length !== 24) throw error;

  const partOneLength = 16;
  let type = RfID.slice(partOneLength - 2, partOneLength);
  if (type !== '1F' && type !== '00') type = '00';

  const payload = RfID.slice(partOneLength);
  const crcChar: string = payload.slice(-1);
  const crcNum = parseInt(crcChar, 16);
  const computedCrc = payload
    .slice(0, payload.length - 1)
    .split('')
    .reduce(
      (accumulator: number, currentValue: string) =>
        accumulator + parseInt(currentValue, 16),
      0,
    );
  if (computedCrc % 15 !== crcNum) throw error;

  return '0'.repeat(partOneLength - 2) + type + payload;
};

export default FormatRfID;
