import React from "react";
import { createStyles, makeStyles } from "@mui/styles";
import { Theme } from '@mui/material/styles';
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import AccountCircle from "@mui/icons-material/AccountCircle";
import { useUser } from "../context/AuthContext";
import AppleIcon from "@mui/icons-material/Apple";
import { Button, Menu, MenuItem } from "@mui/material";
import { useRouter } from "next/router";
import { Auth } from "aws-amplify";
import AddIcon from "@mui/icons-material/Add";
import { Tooltip } from "@mui/material";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            flexGrow: 1,
            marginBottom: 32,
        },
        menuButton: {
            marginRight: theme.spacing(2),
        },
        title: {
            flexGrow: 1,
        },
    }),
);

export default function Header() {
    const classes = useStyles();
    const router = useRouter();
    const { user } = useUser();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const signUserOut = async () => {
        await Auth.signOut();
    };

    return (
        <div className={classes.root}>
            <AppBar position="static" color="inherit">
                <Toolbar>
                    <IconButton
                        edge="start"
                        className={classes.menuButton}
                        color="inherit"
                        aria-label="menu"
                        onClick={() => router.push(`/`)}
                    >
                        <AppleIcon />
                    </IconButton>
                    <Typography variant="h6" className={classes.title}>
                        Picx
                    </Typography>
                    {user && (
                        <div>
                            <Tooltip title="Create Post">
                                <IconButton
                                    onClick={() => router.push(`/create`)}
                                    aria-label="create"
                                    color="inherit"
                                >
                                    <AddIcon />
                                </IconButton>
                            </Tooltip>
                            <IconButton
                                aria-label="account of current user"
                                aria-controls="menu-appbar"
                                aria-haspopup="true"
                                onClick={handleMenu}
                                color="inherit"
                            >
                                <AccountCircle />
                            </IconButton>
                            <Menu
                                id="menu-appbar"
                                anchorEl={anchorEl}
                                anchorOrigin={{
                                    vertical: "top",
                                    horizontal: "right",
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: "top",
                                    horizontal: "right",
                                }}
                                open={open}
                                onClose={handleClose}
                            >
                                <MenuItem onClick={() => signUserOut()}>Sign Out</MenuItem>
                            </Menu>
                        </div>
                    )}
                    {!user && (
                        <>
                            <Button variant="outlined" onClick={() => router.push(`/login`)}>
                                Login
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => router.push(`/signup`)}
                            >
                                Sign Up
                            </Button>
                        </>
                    )}
                </Toolbar>
            </AppBar>
        </div>
    );
}
