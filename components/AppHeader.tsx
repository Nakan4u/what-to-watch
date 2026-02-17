"use client";

import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Drawer,
  List,
  ListItemButton,
  Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import LoginIcon from "@mui/icons-material/Login";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import PlaylistPlayIcon from "@mui/icons-material/PlaylistPlay";
import MenuIcon from "@mui/icons-material/Menu";
import { useTranslations } from "next-intl";
import { useSession, signOut } from "next-auth/react";
import { Link, useRouter } from "@/i18n/navigation";
import AppLogo from "./AppLogo";
import LanguageSwitcher from "./LanguageSwitcher";
import { useNotification } from "@/components/NotificationContext";

const MOBILE_BREAKPOINT = "md";

export default function AppHeader() {
  const t = useTranslations("nav");
  const router = useRouter();
  const { showNotification } = useNotification();
  const { data: session, status } = useSession();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMobileDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const closeMobileAnd = (fn: () => void) => {
    setMobileOpen(false);
    fn();
  };

  const handleWatchlist = () => {
    handleMenuClose();
    router.push("/watchlist");
  };

  const handleProfile = () => {
    handleMenuClose();
    router.push("/profile");
  };

  const handleSignOut = () => {
    handleMenuClose();
    setMobileOpen(false);
    showNotification(t("signOutSuccess"), "success");
    signOut();
  };

  const mobileNav = (
    <Box sx={{ width: 280 }} role="presentation">
      <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <AppLogo size={28} />
        <Typography variant="h6">What To Watch?</Typography>
      </Box>
      <Divider />
      <List>
        <ListItemButton
          component={Link}
          href="/browse"
          onClick={() => setMobileOpen(false)}
          sx={{ py: 1.5 }}
        >
          <ListItemIcon>
            <SearchIcon />
          </ListItemIcon>
          <ListItemText primary={t("browse")} />
        </ListItemButton>
        {status === "loading" ? null : session ? (
          <>
            <ListItemButton
              onClick={() => closeMobileAnd(() => router.push("/watchlist"))}
              sx={{ py: 1.5 }}
            >
              <ListItemIcon>
                <PlaylistPlayIcon />
              </ListItemIcon>
              <ListItemText primary={t("myWatchlist")} />
            </ListItemButton>
            <ListItemButton
              onClick={() => closeMobileAnd(() => router.push("/profile"))}
              sx={{ py: 1.5 }}
            >
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary={t("profile")} />
            </ListItemButton>
            <ListItemButton onClick={handleSignOut} sx={{ py: 1.5 }}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary={t("signOut")} />
            </ListItemButton>
          </>
        ) : (
          <ListItemButton
            component={Link}
            href="/login"
            onClick={() => setMobileOpen(false)}
            sx={{ py: 1.5 }}
          >
            <ListItemIcon>
              <LoginIcon />
            </ListItemIcon>
            <ListItemText primary={t("signIn")} />
          </ListItemButton>
        )}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Language
        </Typography>
        <LanguageSwitcher light />
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography
            component="h1"
            variant="h6"
            sx={{ flexGrow: 1, display: "flex", alignItems: "center", gap: 2 }}
          >
            <Link
              href="/"
              style={{
                color: "inherit",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <AppLogo size={28} />
              <span className="ml-2">What To Watch?</span>
            </Link>
          </Typography>
          <IconButton
            color="inherit"
            aria-label="Open menu"
            edge="end"
            onClick={handleMobileDrawerToggle}
            sx={{ display: { [MOBILE_BREAKPOINT]: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Box
            sx={{
              display: { xs: "none", [MOBILE_BREAKPOINT]: "flex" },
              alignItems: "center",
              gap: 2,
            }}
          >
            <Button
              color="inherit"
              component={Link}
              href="/browse"
              startIcon={<SearchIcon />}
            >
              {t("browse")}
            </Button>
            {status === "loading" ? null : session ? (
              <>
                <IconButton
                  onClick={handleMenuOpen}
                  size="small"
                  sx={{ ml: 1 }}
                  aria-controls={open ? "user-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? "true" : undefined}
                  color="inherit"
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar
                      src={session.user?.image ?? undefined}
                      sx={{ width: 32, height: 32 }}
                      alt={session.user?.name ?? session.user?.email ?? ""}
                    >
                      {!session.user?.image && (
                        <PersonIcon sx={{ fontSize: 20 }} />
                      )}
                    </Avatar>
                    <Typography
                      variant="body2"
                      component="span"
                      sx={{ display: { xs: "none", sm: "inline" } }}
                    >
                      {session.user?.name ?? session.user?.email}
                    </Typography>
                  </Box>
                </IconButton>
                <Menu
                  id="user-menu"
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleMenuClose}
                  transformOrigin={{ horizontal: "right", vertical: "top" }}
                  anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                  slotProps={{
                    paper: {
                      sx: { minWidth: 160 },
                    },
                  }}
                >
                  <MenuItem onClick={handleWatchlist}>
                    <ListItemIcon>
                      <PlaylistPlayIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>{t("myWatchlist")}</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={handleProfile}>
                    <ListItemIcon>
                      <PersonIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>{t("profile")}</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={handleSignOut}>
                    <ListItemIcon>
                      <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>{t("signOut")}</ListItemText>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button
                color="inherit"
                component={Link}
                href="/login"
                startIcon={<LoginIcon />}
              >
                {t("signIn")}
              </Button>
            )}
            <LanguageSwitcher />
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="temporary"
        anchor="right"
        open={mobileOpen}
        onClose={handleMobileDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", [MOBILE_BREAKPOINT]: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: 280,
          },
        }}
      >
        {mobileNav}
      </Drawer>
    </>
  );
}
