import { Button, Grid, TextField } from "@mui/material";
import { Container } from "@mui/material";
import React, { ReactElement, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import ImageDropzone from "../components/ImageDropzone";
import Snackbar from '@mui/material/Snackbar';
import { API, Storage } from "aws-amplify";
import { v4 as uuidv4 } from "uuid";
import { createPost } from "../graphql/mutations";
import { CreatePostInput, CreatePostMutation } from "../API";
import { useRouter } from "next/router";
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import { GRAPHQL_AUTH_MODE } from "@aws-amplify/api";

interface IFormInput {
    title: string;
    content: string;
}

interface Props { }

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
    props,
    ref,
) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function Create({ }: Props): ReactElement {
    const [file, setFile] = useState<File>();
    const [open, setOpen] = useState(false);
    const [alertText, setAlertText] = useState("");
    const router = useRouter();


    const handlePostClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpen(false);
    };

    const {
        register,
        formState: { errors },
        handleSubmit,
    } = useForm<IFormInput>();

    const onSubmit: SubmitHandler<IFormInput> = async (data) => {
        // User uploaded file
        if (file) {
            // Send a request to upload to the S3 Bucket.
            try {
                const imagePath = uuidv4();

                await Storage.put(imagePath, file, {
                    contentType: file.type, // contentType is optional
                });

                const createNewPostInput: CreatePostInput = {
                    title: data.title,
                    contents: data.content,
                    image: imagePath,
                    upvotes: 0,
                    downvotes: 0,
                };

                const createNewPost = (await API.graphql({
                    query: createPost,
                    variables: { input: createNewPostInput },
                    authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
                })) as { data: CreatePostMutation };

                setOpen(true);
                setAlertText("Post created");
                router.push(`/post/${createNewPost.data.createPost.id}`);
            } catch (error) {
                setOpen(true);
                setAlertText(error.message);
            }
        } else {
            try {
                const createNewPostWithoutImageInput: CreatePostInput = {
                    title: data.title,
                    contents: data.content,
                    upvotes: 0,
                    downvotes: 0,
                };

                const createNewPostWithoutImage = (await API.graphql({
                    query: createPost,
                    variables: { input: createNewPostWithoutImageInput },
                    authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
                })) as { data: CreatePostMutation };
                setOpen(true);
                setAlertText("Post created");
                router.push(`/post/${createNewPostWithoutImage.data.createPost.id}`);
            } catch (error) {
                setOpen(true);
                setAlertText(error.message);
            }
        }
    };

    return (
        <Container maxWidth="md">
            {/* Create a form where: */}
            <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
                <Grid container spacing={4} direction="column" >
                    {/* Title of the post */}
                    <Grid item>
                        <TextField
                            variant="outlined"
                            id="title"
                            label="Post Title"
                            type="text"
                            fullWidth
                            error={errors.title ? true : false}
                            helperText={errors.title ? errors.title.message : null}
                            {...register("title", {
                                required: { value: true, message: "Please enter a title." },
                                maxLength: {
                                    value: 120,
                                    message:
                                        "Please enter a title that is 120 characters or less.",
                                },
                            })}
                        />
                    </Grid>
                    {/* Contents of the post */}
                    <Grid item>
                        <TextField
                            variant="outlined"
                            id="content"
                            label="Post Content"
                            type="text"
                            fullWidth
                            multiline
                            error={errors.content ? true : false}
                            helperText={errors.content ? errors.content.message : null}
                            {...register("content", {
                                required: {
                                    value: true,
                                    message: "Please enter some content for your post.",
                                },
                                maxLength: {
                                    value: 1000,
                                    message:
                                        "Please make sure your content is 1000 characters or less.",
                                },
                            })}
                        />
                    </Grid>
                    {/* Optional Image of the post */}
                    <Grid item marginBottom={2}>
                        <ImageDropzone file={file} setFile={setFile} />
                    </Grid>

                    {/* Button to submit the form with those contents */}

                    <Button variant="contained" type="submit">
                        Create Post
                    </Button>
                    <Snackbar open={open} autoHideDuration={6000} onClose={handlePostClose}>
                        <Alert onClose={handlePostClose} severity="error" sx={{ width: '100%' }}>
                            {alertText}
                        </Alert>
                    </Snackbar>
                    <Snackbar open={open} autoHideDuration={6000} onClose={handlePostClose}>
                        <Alert onClose={handlePostClose} severity="success" sx={{ width: '100%' }}>
                            {alertText}
                        </Alert>
                    </Snackbar>
                </Grid>
            </form>
        </Container>
    );
}
