import { Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useContext } from "react";

import "./style.css";
import BlogList from "../../components/blog-list/BlogList";
import LeftSideBar from "../../components/left-side-bar/LeftSideBar";
import RightSideBar from "../../components/right-side-bar/RightSideBar";
import Blog from "../blog/Blog";
import { db } from "../../firebase/configuration/firebase-config";
import { context } from "../../context/ContextProvider";
import fixBlogObj from "../../functions/formatHtml";
import { Margin } from "../../hooks/Margin";

export default function Home() {
  const [blogs, setBlogs] = useState([]);
  const [rendered, setRenderd] = useState(false);
  const { leftMargin, rightMargin } = Margin(rendered);

  const { closeProfileToolTip, user } = useContext(context);

  useEffect(() => {
    if (user) {
      let unsub = 0;
      try {
        unsub = getBlogs();
      } catch (error) {
        console.warn(error);
      }
      return unsub;
    }
  }, [user]);
  useEffect(() => {
    setRenderd(true);
  }, []);

  function getBlogs() {
    console.log("Getting Blogs");
    const blogsQuery = query(
      collection(db, `users/${getAuth().currentUser.uid}/blogs`),
      orderBy("timeStamp", "desc")
    );
    const q = onSnapshot(blogsQuery, function (snapshot) {
      let blogsArray = [];
      snapshot.docs.forEach((doc) => {
        const obj = fixBlogObj(doc.data());
        blogsArray.push({ id: doc.id, ...obj });
      });
      setBlogs(blogsArray);
    });
    return q;
  }

  return (
    <div className="home" onClick={closeProfileToolTip}>
      <LeftSideBar />
      <div
        style={{
          marginLeft: leftMargin,
          marginRight: rightMargin,
          paddingInline: "2em",
        }}
      >
        <Routes>
          <Route
            path={`/blog/:userId/:blogId`}
            element={<Blog blogs={blogs} />}
          />
          <Route path="/" element={<BlogList blogs={blogs} />} />
        </Routes>
      </div>
      <RightSideBar />
    </div>
  );
}
