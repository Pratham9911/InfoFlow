import { Octokit } from "@octokit/rest";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const OWNER = "Pratham9911";
const REPO = "infoflow-pdfs";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { fileName, fileBuffer, dept } = req.body;
    const path = `pdfs/${dept.toLowerCase()}/${Date.now()}_${fileName}`;

    const response = await octokit.repos.createOrUpdateFileContents({
      owner: OWNER,
      repo: REPO,
      path: path,
      message: `Upload PDF for ${dept}: ${fileName}`,
      content: fileBuffer, // already base64
    });

    const url = `https://raw.githubusercontent.com/${OWNER}/${REPO}/main/${path}`;
    res.status(200).json({ url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
