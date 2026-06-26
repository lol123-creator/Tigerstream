const fs = require('fs');
const p = 'src/lib/ppv/service.ts';
let c = fs.readFileSync(p, 'utf8');

const oldText = '  const res = await fetch(PPV_API, {\n    next: { revalidate: PPV_REVALIDATE },\n  });\n\n  if (!res.ok) {\n    throw new Error(`PPV API ${res.status}`);\n  }\n\n  const data = (await res.json()) as PpvStreamsResponse;\n  if (!data.success) {\n    throw new Error(\'PPV API returned unsuccessful response\');\n  }';

const newText = '  try {\n    const res = await fetch(PPV_API, {\n      next: { revalidate: PPV_REVALIDATE },\n    });\n\n    if (!res.ok) {\n      console.warn(`PPV API returned ${res.status} - using empty response`);\n      return EMPTY_RESPONSE;\n    }\n\n    const data = (await res.json()) as PpvStreamsResponse;\n    if (!data.success) {\n      console.warn(\'PPV API returned unsuccessful response - using empty\');\n      return EMPTY_RESPONSE;\n    }';

if (c.includes(oldText)) {
  c = c.replace(oldText, newText);
  // Add EMPTY_RESPONSE constant after PPV_REVALIDATE
  const emptyInsert = 'const EMPTY_RESPONSE: PpvStreamsResponse = {\n  success: true,\n  streams: [],\n};\n\n';
  c = c.replace('let cachedPayload', emptyInsert + 'let cachedPayload');
  // Replace the closing
  c = c.replace('  cachedPayload = data;\n  cachedAt = now;\n  return data;\n}', '  cachedPayload = data;\n    cachedAt = now;\n    return data;\n  } catch (err) {\n    console.warn(\'PPV API fetch failed - using empty response:\', err);\n    return EMPTY_RESPONSE;\n  }');
  fs.writeFileSync(p, c, 'utf8');
  console.log('Fixed ppv service with graceful error handling');
} else {
  console.log('Pattern not found');
}
