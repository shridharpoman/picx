import { Container } from '@mui/material';
import { API } from "aws-amplify";
import { listPosts } from '../graphql/queries';
import { useEffect, useState } from 'react';
import { Post, ListPostsQuery } from '../API';
import PostPreview from "../components/PostPreview";


export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchPostsFromApi = async () => {
      const allPosts = (await API.graphql({ query: listPosts })) as {
        data: ListPostsQuery;
        errors: any[]
      };

      if (allPosts.data) {
        setPosts(allPosts.data.listPosts.items as Post[]);
        return allPosts.data.listPosts.items as Post[];
      } else {
        throw new Error("Error fetchings posts");
      }
    };
    fetchPostsFromApi();
  }, []);

  return (
    <Container maxWidth="md">
      {posts.map((post) => (
        <PostPreview key={post.id} post={post} />
      ))}
    </Container>
  );
}
