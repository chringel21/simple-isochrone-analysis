#!/usr/bin/env bash

# Download  everything necessary for styles and styles themselves
# Fonts
wget https://github.com/openmaptiles/fonts/releases/download/v2.0/v2.0.zip
mkdir -p /data/fonts
unzip v2.0.zip -d /data/fonts
rm -f v2.0.zip

# Natural Earth hillshade mbtiles
wget https://github.com/lukasmartinelli/naturalearthtiles/releases/download/v1.0/natural_earth_2.raster.mbtiles
mv natural_earth_2.raster.mbtiles data/natural_earth_2.raster.mbtiles

stylesList=(
  "openmaptiles;maptiler-basic-gl-style;v1.9"
  "openmaptiles;dark-matter-gl-style;v1.8"
  "openmaptiles;fiord-color-gl-style;v1.5"
  "openmaptiles;osm-bright-gl-style;v1.9"
  "openmaptiles;positron-gl-style;v1.8"
  "maputnik;osm-liberty;gh-pages"
)

for style in ${stylesList[@]}
do
  tmpStyleArray=(${style//;/ })
  STYLE_NAMESPACE=${tmpStyleArray[0]}
  STYLE_NAME=${tmpStyleArray[1]}
  VERSION=${tmpStyleArray[2]}
  echo "Downloading $STYLE_NAMESPACE\/$STYLENAME in version $VERSION"
  if [[ $style == *"openmaptiles"* ]]
  then 
    wget https://github.com/$STYLE_NAMESPACE/$STYLE_NAME/releases/download/$VERSION/$VERSION.zip
    mkdir -p /data/styles/$STYLE_NAMESPACE/$STYLE_NAME
    unzip $VERSION.zip -d /data/styles/$STYLE_NAMESPACE/$STYLE_NAME
  else
    wget https://github.com/$STYLE_NAMESPACE/$STYLE_NAME/archive/refs/heads/$VERSION.zip
    mkdir -p /data/styles/$STYLE_NAMESPACE
    unzip $VERSION.zip -d /data/styles/$STYLE_NAMESPACE
    mv /data/styles/$STYLE_NAMESPACE/$STYLE_NAME-$VERSION/style.json /data/styles/$STYLE_NAMESPACE/$STYLE_NAME-$VERSION/style-local.json
    sed "
s,https://api.maptiler.com/tiles/v3/tiles.json?key={key},mbtiles://{v3},g
s,https://maputnik.github.io/osm-liberty/sprites/osm-liberty,{styleJsonFolder}/sprites/osm-liberty,g
s,https://api.maptiler.com/fonts/{fontstack}/{range}.pbf?key={key},{fontstack}/{range}.pbf,g
s,https://klokantech.github.io/naturalearthtiles/tiles/natural_earth_2_shaded_relief.raster/{z}/{x}/{y}.png,mbtiles://{natural_earth_2_shaded_relief},g
" /data/styles/$STYLE_NAMESPACE/$STYLE_NAME-$VERSION/style-local.json > /data/styles/$STYLE_NAMESPACE/$STYLE_NAME-$VERSION/style.json
  fi
  rm -f $VERSION.zip
done
