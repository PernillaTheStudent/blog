import { supabase } from "../lib/supabaseClient";
// import { supabase } from "@supabase/auth-ui-shared";

export const postsCacheKey = "/api/blogs";
// export const postsCacheKey = "/blog";

export const getPosts = async () => {
	const { data, error, status } = await supabase
		.from("posts")
		.select();
	return { data, error, status };
};

export const getPost = async (args) => {
// export const getPost = async (_, { arg: slug }) => {
//export const getPost = async (arg) => {
  console.log("inside getPost")
  const slug = args;
  // console.log("args", args)
  // console.log("this is slug:", slug);

  try {
    const { data, error, status } = await supabase
      .from("posts")
      .select()
      .eq("slug", slug)
      .single();

      // console.error("data",data)
    return { data, status };
  } catch (error) {
    console.error(error);
    // return { data: null, error: 'An error occurred', status: 500 };
    return { error: 'An error occurred', status: 500 };
  }

	// const { data, error, status } = await supabase
	// 	.from("posts")
	// 	.select("*")
	// 	.single()
	// 	.eq("slug", slug);
	// return { data, error, status };
};

export const addPost = async (params) => {
  //Handle add post here
  const { data, error, status } = await supabase
    .from("posts")
    .insert(newPost)
    .select()
    .single()

    return { data, error, status };
};

export const removePost = () => {
  //Handle remove post here
};

export const editPost = async (_, { arg: updatedPost }) => {
  //Handle edit post here
  const { data, error, status } = await supabase
    .from("posts")
    .update(updatedPost)
    .eq("id", updatedPost.id)
    .select()
    .single();

    return { data, error, status };
};
