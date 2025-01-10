import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import {
  alpha,
  CircularProgress,
  IconButton,
  Stack,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import pickMarker from "./assets/pick_marker.png";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

const GoogleMapComponent = ({
  setDisablePickButton,
  setLocationEnabled,
  setLocation,
  setCurrentLocation,
  locationLoading,
  location,
  setPlaceDetailsEnabled,
  placeDetailsEnabled,
  locationEnabled,
  setPlaceDescription,
  height,
  isModalExpand,
  left,
  bottom,
}) => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));
  const containerStyle = {
    width: "100%",
    maxHeight: isModalExpand ? "70dvh" : "50dvh",
    height: isModalExpand
      ? "90vh"
      : height
      ? height
      : isSmall
      ? "350px"
      : "350px",
    paddingBottom: "0px",
  };
  const mapRef = useRef(GoogleMap);
  const center = useMemo(
    () => ({
      lat: parseFloat(location?.lat),
      lng: parseFloat(location?.lng),
    }),
    [location?.lng, location?.lng]
  );

  const options = useMemo(
    () => ({
      zoomControl: false,
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: false,
    }),
    []
  );
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_KEY,
  });
  const [isMounted, setIsMounted] = useState(false);
  const [openInfoWindow, setOpenInfoWindow] = useState(false);
  const [mapSetup, setMapSetup] = useState(false);
  useEffect(() => setIsMounted(true), []);
  const [map, setMap] = useState(null);
  const [zoom, setZoom] = useState(17);
  const [centerPosition, setCenterPosition] = useState(center);

  const onLoad = useCallback(function callback(map) {
    // setZoom(17);
    setMap(map);
  }, []);
  useEffect(() => {
    if (location && placeDetailsEnabled) {
      setCenterPosition(location);
    }
    if (map?.center && mapSetup) {
      setCenterPosition({
        lat: map.center?.lat(),
        lng: map.center?.lng(),
      });
    }

    setIsMounted(true);
  }, [map, mapSetup, placeDetailsEnabled, location]);

  const onUnmount = useCallback(function callback(map) {
    setMap(null);
    // setMapSetup(false)
  }, []);
  const handleZoomIn = () => {
    if (zoom <= 21) {
      setZoom((prevZoom) => Math.min(prevZoom + 1));
    }
  };

  const handleZoomOut = () => {
    if (map && zoom >= 1) {
      setZoom((prevZoom) => Math.max(prevZoom - 1));
    }
  };
  return isLoaded ? (
    <Stack
      padding="0px"
      sx={{
        boxShadow: "inset 0px 4px 4px rgba(0, 0, 0, 0.1)",
        borderRadius: "10px",
        p: "4px",
        position: "relative",
      }}
    >
      <Stack
        position="absolute"
        zIndex={1}
        left={left ? left : "15px"}
        bottom={bottom ? bottom : "6%"}
        direction="column"
        spacing={1}
      >
        <IconButton
          sx={{
            background: (theme) => theme.palette.neutral[100],
            "&:hover": {
              background: (theme) => alpha(theme.palette.neutral[100], 0.8),
            },
          }}
          padding={{ xs: "3px", sm: "5px" }}
          onClick={handleZoomIn}
          disabled={zoom > 21}
        >
          <AddIcon color="primary" />
        </IconButton>
        <IconButton
          sx={{
            background: (theme) => theme.palette.neutral[100],
            "&:hover": {
              background: (theme) => alpha(theme.palette.neutral[100], 0.8),
            },
          }}
          padding={{ xs: "3px", sm: "5px" }}
          onClick={handleZoomOut}
          disabled={zoom < 1}
        >
          <RemoveIcon color="primary" />
        </IconButton>
      </Stack>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center ?? centerPosition}
        onLoad={onLoad}
        zoom={zoom}
        onUnmount={onUnmount}
        onMouseDown={(e) => {
          setMapSetup?.(true);
          setDisablePickButton?.(true);
        }}
        onMouseUp={(e) => {
          setMapSetup?.(false);
          setDisablePickButton?.(false);
          setLocationEnabled?.(true);
          setLocation?.({
            lat: map.center?.lat(),
            lng: map.center?.lng(),
          });
          setCenterPosition?.({
            lat: map.center?.lat(),
            lng: map.center?.lng(),
          });
          setPlaceDetailsEnabled?.(false);
          setPlaceDescription?.(undefined);
        }}
        //  yesIWantToUseGoogleMapApiInternals
        onZoomChanged={() => {
          // setMapSetup(true)
          if (map) {
            setLocationEnabled?.(true);
            setLocation?.({
              lat: map.center?.lat(),
              lng: map.center?.lng(),
            });
            setCenterPosition({
              lat: map.center?.lat(),
              lng: map.center?.lng(),
            });
            // setPlaceDetailsEnabled(false)
          }
        }}
        options={options}
      >
        {!locationLoading ? (
          <img
            src={pickMarker.src}
            style={{
              zIndex: 3,
              position: "absolute",
              marginTop: -63,
              marginLeft: -32,
              left: "50%",
              top: "50%",
              height: "60px",
              width: "45px",
            }}
          />
        ) : (
          <Stack
            alignItems="center"
            style={{
              zIndex: 3,
              position: "absolute",
              marginTop: -37,
              marginLeft: -11,
              left: "50%",
              top: "50%",
            }}
          >
            <CircularProgress />
          </Stack>
        )}
      </GoogleMap>
    </Stack>
  ) : (
    <></>
  );
};

export default GoogleMapComponent;
