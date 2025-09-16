import { Octokit } from "@octokit/rest";
import { NextResponse } from "next/server";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const OWNER = "Pratham9911";
const REPO = "infoflow-pdfs";

export async function POST(req) {
  try {
    const { fileName, fileBuffer, dept } = await req.json();

    if (!fileName || !fileBuffer || !dept) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Path inside repo
    const path = `pdfs/${dept.toLowerCase()}/${Date.now()}_${fileName}`;

    const response = await octokit.repos.createOrUpdateFileContents({
      owner: OWNER,
      repo: REPO,
      path: path,
      message: `Upload PDF for ${dept}: ${fileName}`,
      content: fileBuffer, // already base64
    });

    const url = `https://raw.githubusercontent.com/${OWNER}/${REPO}/main/${path}`;
    return NextResponse.json({ url });
  } catch (error) {
    console.error("GitHub upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
// app/api/uploadToGitHub/route.js
// import { NextResponse } from "next/server";

// export async function POST(req) {
//   console.log("📂 API hit: uploadToGitHub");  // 👈 add this
//   return NextResponse.json({ status: "ok" });
// }
