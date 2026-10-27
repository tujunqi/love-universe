Option Explicit
Dim fso, shell, folder, file, page
Set fso = CreateObject("Scripting.FileSystemObject")
Set shell = CreateObject("WScript.Shell")
Set folder = fso.GetFolder(fso.GetParentFolderName(WScript.ScriptFullName))
page = ""
For Each file In folder.Files
  If LCase(fso.GetExtensionName(file.Name)) = "html" Then
    page = file.Path
    Exit For
  End If
Next
If page = "" Then
  MsgBox "No HTML file found in this folder.", 48, "Our Private Museum"
  WScript.Quit 1
End If
shell.Run """" & page & """", 1, False
