import fs from 'fs';
import path from 'path';

class ASTPatcher {
  injectImportAndTest(filePath, importStatement, testCodeSnippet) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(importStatement)) {
      return { success: true, message: 'Already patched' };
    }
    const lastImportIndex = content.lastIndexOf('import ');
    if (lastImportIndex === -1) {
      content = importStatement + '\n' + content;
    } else {
      const endOfLine = content.indexOf('\n', lastImportIndex);
      content = content.slice(0, endOfLine + 1) + importStatement + '\n' + content.slice(endOfLine + 1);
    }

    const targetMarker = "console.log('\\n🎉 All";
    const targetIndex = content.indexOf(targetMarker);
    if (targetIndex !== -1) {
      content = content.slice(0, targetIndex) + '\n' + testCodeSnippet + '\n\n' + content.slice(targetIndex);
    } else {
      content += '\n' + testCodeSnippet + '\n';
    }

    fs.writeFileSync(filePath, content, 'utf8');
    return { success: true, patched: true };
  }
}

export const astPatcher = new ASTPatcher();
