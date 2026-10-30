// Lightweight EXIF GPS extraction from JPEG ArrayBuffer (Zero external dependencies)
export function getExifGpsCoordinates(buffer: ArrayBuffer): { lat: number; lng: number } | null {
  try {
    const dataView = new DataView(buffer);
    if (dataView.byteLength < 4) return null;

    // Check for JPEG SOI marker (0xFFD8)
    if (dataView.getUint16(0) !== 0xffd8) return null;

    let offset = 2;
    const length = dataView.byteLength;

    while (offset < length - 4) {
      const marker = dataView.getUint16(offset);
      offset += 2;

      // APP1 marker (0xFFE1) contains EXIF
      if (marker === 0xffe1) {
        const app1Length = dataView.getUint16(offset);
        const exifHeader =
          String.fromCharCode(dataView.getUint8(offset + 2)) +
          String.fromCharCode(dataView.getUint8(offset + 3)) +
          String.fromCharCode(dataView.getUint8(offset + 4)) +
          String.fromCharCode(dataView.getUint8(offset + 5));

        if (exifHeader === 'Exif') {
          return parseTiffGps(dataView, offset + 8);
        }
        offset += app1Length;
      } else if ((marker & 0xff00) === 0xff00) {
        // Skip other markers
        const markerLength = dataView.getUint16(offset);
        offset += markerLength;
      } else {
        break;
      }
    }
  } catch (e) {
    console.warn('Failed to parse EXIF metadata:', e);
  }
  return null;
}

function parseTiffGps(view: DataView, tiffStart: number): { lat: number; lng: number } | null {
  try {
    const byteOrder = view.getUint16(tiffStart);
    const littleEndian = byteOrder === 0x4949; // 'II'

    // TIFF magic 42
    if (view.getUint16(tiffStart + 2, littleEndian) !== 0x002a) return null;

    const firstIfdOffset = view.getUint32(tiffStart + 4, littleEndian);
    if (firstIfdOffset < 8) return null;

    let ifdOffset = tiffStart + firstIfdOffset;
    const numEntries = view.getUint16(ifdOffset, littleEndian);
    ifdOffset += 2;

    let gpsIfdOffset = 0;

    for (let i = 0; i < numEntries; i++) {
      const tag = view.getUint16(ifdOffset, littleEndian);
      if (tag === 0x8825) {
        // GPSInfo pointer tag
        gpsIfdOffset = view.getUint32(ifdOffset + 8, littleEndian);
        break;
      }
      ifdOffset += 12;
    }

    if (!gpsIfdOffset) return null;

    let gpsOffset = tiffStart + gpsIfdOffset;
    const numGpsEntries = view.getUint16(gpsOffset, littleEndian);
    gpsOffset += 2;

    let latRef = 'N';
    let lngRef = 'E';
    let latValues: number[] = [];
    let lngValues: number[] = [];

    for (let i = 0; i < numGpsEntries; i++) {
      const tag = view.getUint16(gpsOffset, littleEndian);
      const valOffset = tiffStart + view.getUint32(gpsOffset + 8, littleEndian);

      if (tag === 0x0001) {
        // GPSLatitudeRef
        latRef = String.fromCharCode(view.getUint8(gpsOffset + 8));
      } else if (tag === 0x0002) {
        // GPSLatitude (3 rationals)
        latValues = readRationals(view, valOffset, 3, littleEndian);
      } else if (tag === 0x0003) {
        // GPSLongitudeRef
        lngRef = String.fromCharCode(view.getUint8(gpsOffset + 8));
      } else if (tag === 0x0004) {
        // GPSLongitude (3 rationals)
        lngValues = readRationals(view, valOffset, 3, littleEndian);
      }
      gpsOffset += 12;
    }

    if (latValues.length === 3 && lngValues.length === 3) {
      let lat = latValues[0] + latValues[1] / 60 + latValues[2] / 3600;
      let lng = lngValues[0] + lngValues[1] / 60 + lngValues[2] / 3600;

      if (latRef === 'S') lat = -lat;
      if (lngRef === 'W') lng = -lng;

      if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
        return { lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) };
      }
    }
  } catch (err) {
    console.warn('Error reading GPS IFD:', err);
  }
  return null;
}

function readRationals(view: DataView, offset: number, count: number, littleEndian: boolean): number[] {
  const result: number[] = [];
  for (let i = 0; i < count; i++) {
    const num = view.getUint32(offset + i * 8, littleEndian);
    const den = view.getUint32(offset + i * 8 + 4, littleEndian);
    result.push(den === 0 ? 0 : num / den);
  }
  return result;
}

