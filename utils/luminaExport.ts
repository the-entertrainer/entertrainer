import { saveAs } from 'file-saver'
import JSZip from 'jszip'
import type { LuminaCourse } from '~/types/lumina'
import { renderPlayerHtml } from '~/utils/luminaPlayer'

export function luminaSafeName(name: string) {
  return name.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'course'
}

function xmlEsc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

// Standalone HTML — one file, double-clickable, hostable anywhere.
export function exportLuminaHtml(course: LuminaCourse) {
  const html = renderPlayerHtml(course, { scorm: false })
  saveAs(new Blob([html], { type: 'text/html;charset=utf-8' }), `${luminaSafeName(course.title)}.html`)
}

// The editable project file for the shelf / sharing between authors.
export function exportLuminaProject(course: LuminaCourse) {
  saveAs(
    new Blob([JSON.stringify(course, null, 2)], { type: 'application/json' }),
    `${luminaSafeName(course.title)}.lumina`
  )
}

// SCORM 1.2 package: imsmanifest.xml + the same self-contained player with
// the SCORM runtime compiled in (Initialize / SetValue / Commit / Finish,
// suspend/resume via cmi.suspend_data, per-quiz cmi.interactions, score).
// SCORM 1.2 is the profile every LMS in the wild accepts.
export async function exportLuminaScorm(course: LuminaCourse) {
  const id = luminaSafeName(course.title)
  const title = xmlEsc(course.title || 'Untitled Course')

  const manifest = `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="lumina.${xmlEsc(id)}" version="1.2"
  xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
  xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd
                      http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
  </metadata>
  <organizations default="org">
    <organization identifier="org">
      <title>${title}</title>
      <item identifier="item-1" identifierref="res-1">
        <title>${title}</title>
        <adlcp:masteryscore>80</adlcp:masteryscore>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="res-1" type="webcontent" adlcp:scormtype="sco" href="index.html">
      <file href="index.html"/>
    </resource>
  </resources>
</manifest>`

  const zip = new JSZip()
  zip.file('imsmanifest.xml', manifest)
  zip.file('index.html', renderPlayerHtml(course, { scorm: true }))
  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' })
  saveAs(blob, `${id}-scorm12.zip`)
}
