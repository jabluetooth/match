/**
 * Lightweight magic-byte validation for uploaded resume files. Confirms the
 * first bytes of the buffer match what the claimed `file.type` implies, so a
 * mislabeled or spoofed content-type can't slip past the MIME allowlist.
 */

const SIGNATURES: Record<string, number[]> = {
  'application/pdf': [0x25, 0x50, 0x44, 0x46], // %PDF
  // DOCX is a zip archive — all Office Open XML files share the zip signature.
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [0x50, 0x4b, 0x03, 0x04],
  // Legacy .doc (OLE Compound File Binary Format).
  'application/msword': [0xd0, 0xcf, 0x11, 0xe0],
};

export function matchesFileSignature(bytes: Buffer, mimeType: string): boolean {
  const signature = SIGNATURES[mimeType];
  if (!signature) return false;
  if (bytes.length < signature.length) return false;
  return signature.every((byte, i) => bytes[i] === byte);
}
