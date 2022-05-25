import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
} from "firebase/firestore";

import "./style.css";
import { LoginButton } from "../../components/login-button/LoginButton";
import loginWithTestUser from "../../firebase/function/testUser";
import { useState, useEffect } from "react";
import { db } from "../../firebase/configuration/firebase-config";
import fixBlogObj from "../../functions/formatHtml";
import BlogList from "../../components/blog-list/BlogList";

const LandingPage = () => {
  const [recentBlogs, setRecentBlogs] = useState([]);

  useEffect(() => {
    getRecentBlog(setRecentBlogs);
  }, []);

  return (
    <div className="landing-page">
      <div className="recent-blogs">
        {recentBlogs.length === 0 ? (
          <h1>Getting Recent Blogs</h1>
        ) : (
          <BlogList addButton={false} blogs={recentBlogs} />
        )}
      </div>
      <div className="login-container">
        <h1>Login</h1>
        <div className="userpass">
          <div>
            <h4>User id:</h4>
            <input type="text" value={"******"} readOnly name="" id="" />
          </div>
          <div>
            <h4>Password:</h4>
            <input type="text" value={"*******"} readOnly name="" id="" />
          </div>
          <div>
            <button onClick={loginWithTestUser}>Login as Test user</button>
          </div>
        </div>
        <LoginButton />
      </div>
    </div>
  );
};
export default LandingPage;

async function getRecentBlog(setRecentBlogs) {
  const recentBlogs = [];
  console.log("Getting Blogs");
  const blogsQuery = query(
    collection(db, `recentBlogs`),
    orderBy("timeStamp", "desc"),
    limit(10)
  );
  const docs = await getDocs(blogsQuery);
  const docsSize = docs.size;
  let count = 0;
  docs.forEach(async (doc) => {
    try {
      const blogObj = await getBlog(doc.data().url);
      recentBlogs.push(fixBlogObj(blogObj));
      count = count + 1;
      if (count === docsSize) setRecentBlogs(recentBlogs);
    } catch {
      console.log("something gone wrong");
    }
  });
}

async function getBlog(path = "") {
  const [userId, blogId] = path.split("/");
  console.log(userId, blogId);
  const docRef = `users/${userId.trim()}/blogs/${blogId}`;
  const docObj = await getDoc(doc(db, docRef));
  return { authorId: userId.trim(), id: blogId, ...docObj.data() };
}
