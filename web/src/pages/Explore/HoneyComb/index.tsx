//EXPLORE MAP
import React, { useState, useEffect } from 'react';

//components
import {
  ExploreMapState,
  FindButtons,
  UpdateBoundsFilteredButtons,
  UpdateCachedHexagons,
  UpdateExploreUpdating,
  UpdateQueryFoundTags,
  UpdateListButtons,
  UpdateExploreSettings,
  ExploreSettings,
  ClearCachedHexagons,
  SetExploreSettingsBoundsLoaded,
} from 'state/Explore';
import NavHeader from 'components/nav/NavHeader'; //just for mobile
import { useRef, useStore } from 'store/Store';
import { GlobalState, store } from 'pages';
import { withRouter } from 'next/router';
import List from 'components/list/List';
import { Point } from 'pigeon-maps';
import { LoadabledComponent } from 'components/loading';
import HexagonExploreMap from 'components/map/Map/HexagonExploreMap';
import {
  calculateDensityMap,
  convertBoundsToGeoJsonHexagons,
  getResolution,
  recalculateDensityMap,
  roundCoord,
} from 'shared/honeycomb.utils';
import _ from 'lodash';
import { useDebounce, useToggle } from 'shared/custom.hooks';
import AdvancedFilters from 'components/search/AdvancedFilters';
import { Button } from 'shared/entities/button.entity';
import { getDistance, isPointWithinRadius } from 'geolib';
import { ShowMobileOnly } from 'elements/SizeOnly';
import { ShowDesktopOnly } from 'elements/SizeOnly';
import { uniqueArray } from 'shared/sys.helper';
import { applyCustomFieldsFilters } from 'components/button/ButtonType/CustomFields/AdvancedFiltersCustomFields';

const defaultZoomPlace = 13;

function HoneyComb({ router }) {
  const currentButton = useRef(
    store,
    (state: GlobalState) => state.explore.currentButton,
  );

  const selectedNetwork = useRef(
    store,
    (state: GlobalState) => state.networks.selectedNetwork,
    false,
  );

  const exploreMapState: ExploreMapState = useStore(
    store,
    (state: GlobalState) => state.explore.map,
    false,
  );

  const exploreSettings: ExploreSettings = useStore(
    store,
    (state: GlobalState) => state.explore.settings,
    false,
  );
  
  const [showFiltersForm, toggleShowFiltersForm] = useToggle(false);
  const [showLeftColumn, toggleShowLeftColumn] = useToggle(true);

  const height = showLeftColumn ? 0 : 400;

  useExploreSettings({
    exploreSettings,
    router,
    selectedNetwork,
    toggleShowFiltersForm,
  });

  const {
    handleBoundsChange,
    setHexagonsToFetch,
    setHexagonClicked,
    hexagonClicked,
    isRedrawingMap,
    h3TypeDensityHexes,
  } = useHexagonMap({
    toggleShowLeftColumn,
    exploreSettings,
    filters: exploreMapState.filters,
    boundsFilteredButtons: exploreMapState.boundsFilteredButtons,
    cachedHexagons: exploreMapState.cachedHexagons,
    buttonTypes: selectedNetwork.buttonTemplates
  });

  useEffect(() => {
    if (
      exploreMapState.filters &&
      exploreMapState.filters.where.center
    ) {
      store.emit(
        new UpdateExploreSettings({
          center: exploreMapState.filters.where.center,
        }),
      );
    }
  }, [exploreMapState.filters]);

  return (
    <div className="index__explore-container">
      <div
        className={
          'index__content-left ' +
          (showLeftColumn ? '' : 'index__content-left--hide')
        }
      >
        <NavHeader
          hexagonClicked={hexagonClicked}
          toggleShowFiltersForm={toggleShowFiltersForm}
          totalNetworkButtonsCount={selectedNetwork.buttonCount}
        />
        <AdvancedFilters
          showFiltersForm={showFiltersForm}
          toggleShowFiltersForm={toggleShowFiltersForm}
        />
        <ShowDesktopOnly>
          <List
            showFiltersForm={showFiltersForm}
            buttons={exploreMapState.listButtons}
            showLeftColumn={showLeftColumn}
            onLeftColumnToggle={toggleShowLeftColumn}
          />
        </ShowDesktopOnly>
      </div>
      <LoadabledComponent
        loading={exploreSettings.loading && !selectedNetwork}
      >
        <HexagonExploreMap
          exploreSettings={exploreSettings}
          h3TypeDensityHexes={h3TypeDensityHexes}
          currentButton={currentButton}
          handleBoundsChange={handleBoundsChange}
          setHexagonsToFetch={setHexagonsToFetch}
          setHexagonClicked={setHexagonClicked}
          hexagonClicked={hexagonClicked}
          isRedrawingMap={isRedrawingMap}
          selectedNetwork={selectedNetwork}
        />
      </LoadabledComponent>

      <ShowMobileOnly>
        <div
          className={
            'index__content-bottom ' +
            (showLeftColumn ? '' : 'index__content-bottom--hide')
          }
        >
          <List
            showFiltersForm={showFiltersForm}
            buttons={exploreMapState.listButtons}
            showLeftColumn={showLeftColumn}
            onLeftColumnToggle={toggleShowLeftColumn}
          />
        </div>
      </ShowMobileOnly>
    </div>
  );
}

export default withRouter(HoneyComb);

function useExploreSettings({
  router,
  selectedNetwork,
  toggleShowFiltersForm,
  exploreSettings,
}) {
  let queryExploreSettings = {};
  let URLParamsCoords = false;
  const getUrlParams = (path) => {
    const findHash = path.indexOf('#');
    if (findHash) {
      let params = new URLSearchParams(
        router.asPath.substr(findHash + 1),
      );
      return params;
    }
    return [];
  };

  useEffect(() => {
    if (router && router.asPath) {
      const params = getUrlParams(router.asPath);

      const lat = parseFloat(params.get('lat'));
      const lng = parseFloat(params.get('lng'));
      const zoom = parseInt(params.get('zoom'));
      const showFilters = params.get('showFilters');
      if (lat && lng) {
        URLParamsCoords = true;
        store.emit(
          new UpdateExploreSettings({
            center: [lat, lng],
            zoom: zoom,
          }),
        );
      }

      if (showFilters == 'true') {
        toggleShowFiltersForm(true);
        params.delete('showFilters');
      }
    }
  }, [router]);
  useEffect(() => {
    if (selectedNetwork && exploreSettings) {
      if(exploreSettings?.center == null && !URLParamsCoords)
      {
        store.emit(
          new UpdateExploreSettings({
            center: selectedNetwork.exploreSettings.center,
            zoom: selectedNetwork.exploreSettings.zoom,
            loading: true,
          }),
        );
      }
      
    }
  }, [selectedNetwork]);

  useEffect(() => {

    if (exploreSettings?.center && !URLParamsCoords) {
      let urlParams = new URLSearchParams();

      urlParams.append('zoom', exploreSettings.zoom);
      urlParams.append('lat', roundCoord(exploreSettings.center[0]));
      urlParams.append('lng', roundCoord(exploreSettings.center[1]));

      window.location.replace(`#?${urlParams.toString()}`);
    }
  }, [exploreSettings]);
}

// const loaded = false
store.emit(new ClearCachedHexagons());

function useHexagonMap({
  toggleShowLeftColumn,
  exploreSettings,
  filters,
  boundsFilteredButtons,
  cachedHexagons,
  buttonTypes,
}) {
  const [hexagonClicked, setHexagonClicked] = useState(null);
  const debouncedHexagonClicked = useDebounce(hexagonClicked, 70);

  const [hexagonsToFetch, setHexagonsToFetch] = useState({
    resolution: 1,
    hexagons: [],
  });
  const debounceHexagonsToFetch = useDebounce(hexagonsToFetch, 100);
  const [isRedrawingMap, setIsRedrawingMap] = useState(false);
  const foundTags = React.useRef([]);
  const [h3TypeDensityHexes, seth3TypeDensityHexes] = useState([]);
  let cachedH3Hexes = React.useRef(cachedHexagons);
  const calculateNonCachedHexagons = (
    debounceHexagonsToFetch,
    cachedH3Hexes,
  ) => {
    return debounceHexagonsToFetch.hexagons.reduce(
      (hexagonsToFetch, hexagon) => {
        const cacheHit = cachedH3Hexes.current.find(
          (cachedHex) => cachedHex.hexagon == hexagon,
        );
        if (!cacheHit) {
          hexagonsToFetch.push(hexagon);
        }
        return hexagonsToFetch;
      },
      [],
    );
  };

  const recalculateCacheH3Hexes = (newDensityMapHexagons) => {
    cachedH3Hexes.current = uniqueArray([
      ...cachedH3Hexes.current,
      ...newDensityMapHexagons,
    ]);
    store.emit(new UpdateCachedHexagons(cachedH3Hexes.current));
  };

  useEffect(() => {
    if (debounceHexagonsToFetch.hexagons.length > 0) {
      const hexesToFetch = calculateNonCachedHexagons(
        debounceHexagonsToFetch,
        cachedH3Hexes,
      );
      if (hexesToFetch.length > 0) {
        store.emit(new UpdateExploreUpdating());
        store.emit(
          new FindButtons(
            debounceHexagonsToFetch.resolution,
            hexesToFetch,
            (buttons) => {
              const newDensityMapHexagons = calculateDensityMap(
                buttons,
                debounceHexagonsToFetch.resolution,
                hexesToFetch,
              );
              recalculateCacheH3Hexes(newDensityMapHexagons);
              updateDensityMap();
            },
            (error) => {
              console.error(error);
            },
          ),
        );
      } else {
        updateDensityMap();
      }
    }
  }, [debounceHexagonsToFetch]);

  function updateDensityMap() {
    store.emit(new UpdateExploreUpdating());
    setIsRedrawingMap(() => true);
    seth3TypeDensityHexes(() => []);
    const boundsButtons = cachedH3Hexes.current.filter(
      (cachedHex) => {
        return debounceHexagonsToFetch.hexagons.find(
          (hexagon) => hexagon == cachedHex.hexagon,
        );
      },
    );
    const { filteredButtons, filteredHexagons } = applyFilters(
      filters,
      boundsButtons,
    );
    let filteredButtonsOrdered = orderByClosestToCenter(filters.where?.center, filteredButtons)
    seth3TypeDensityHexes(() => {
      return filteredHexagons;
    });

    store.emit(new UpdateBoundsFilteredButtons(filteredButtonsOrdered));
    store.emit(new UpdateListButtons(filteredButtonsOrdered));
    setIsRedrawingMap(() => false);
  }

  useEffect(() => {
    setHexagonClicked(() => null);
    updateDensityMap();
  }, [filters]);

  const applyFilters = (filters, cachedHexagons) => {
    const applyButtonTypesFilter = (button, buttonTypes) => {
      if (buttonTypes.length == 0) {
        return true;
      }
      if (buttonTypes.length > 0) {
        return buttonTypes.indexOf(button.type) > -1;
      }
      return false;
    };

    const applyQueryFilter = (button, query) => {
      if (query && query.length > 0) {
        return (
          button.title.indexOf(query) > -1 ||
          button.description.indexOf(query) > -1
        );
      }
      return true;
    };

    const applyWhereFilter = (button: Button, where) => {
      if (where.center && where.radius) {
        return isPointWithinRadius(
          { latitude: button.latitude, longitude: button.longitude },
          { latitude: where.center[0], longitude: where.center[1] },
          where.radius * 1000,
        );
      }
      return true;
    };

    const applyTagFilters = (button: Button, tags: string[]) => {
      if (tags.length == 0) {
        return true;
      }
      if (tags.length > 0) {
        const tagsFound = _.intersection(tags, button.tags);
        if (tagsFound.length > 0) {
          return true;
        }
      }
      return false;
    };

    const findMoreTags = (button: Button, queryTags) => {
      const tagsFound = _.intersection(queryTags, button.tags);
      if (tagsFound.length > 0) {
        foundTags.current = _.union(foundTags.current, tagsFound);
      }
    };

    let queryTags = filters.query
      .split(' ')
      .filter((value) => value.length > 0);
    foundTags.current = [];

    const res = cachedHexagons.reduce(
      ({ filteredButtons, filteredHexagons }, hexagonCached) => {
        const moreButtons = hexagonCached.buttons.filter(
          (button: Button) => {
            if (
              !applyButtonTypesFilter(button, filters.helpButtonTypes)
            ) {
              return false;
            }

            findMoreTags(button, queryTags);
            if (!applyTagFilters(button, foundTags.current)) {
              return false;
            }

            // remove tags from query string, so it won't fail to search string
            let query = filters.query;
            foundTags.current.forEach(
              (tag) => (query = query.replace(tag, '')),
            );
            if (!applyQueryFilter(button, query)) {
              return false;
            }
            if (!applyWhereFilter(button, filters.where)) {
              return false;
            }
            if(!applyCustomFieldsFilters(button, filters, buttonTypes)) {
              return false;
            }
            return true;
          },
        );

        filteredHexagons.push({
          ...hexagonCached,
          buttons: moreButtons,
        });
        return {
          filteredButtons: filteredButtons.concat(moreButtons),
          filteredHexagons: filteredHexagons,
        };
      },
      { filteredButtons: [], filteredHexagons: [] },
    );

    store.emit(new UpdateQueryFoundTags(foundTags.current));
    return {
      filteredButtons: res.filteredButtons,
      filteredHexagons: recalculateDensityMap(res.filteredHexagons),
    };
  };

  const handleBoundsChange = (bounds, center: Point, zoom) => {
    setHexagonClicked(() => null); // unselect all hexagons

    if (bounds) {
      store.emit(
        new UpdateExploreSettings({
          zoom: zoom,
          bounds: bounds,
          loading: true,
          center: center,
        }),
      );

      const boundsHexes = convertBoundsToGeoJsonHexagons(
        bounds,
        getResolution(zoom),
      );
      store.emit(new SetExploreSettingsBoundsLoaded());
      if (boundsHexes.length > 1000) {
        console.error('too many hexes.. canceling..');
        return;
      }
      setHexagonsToFetch({
        resolution: getResolution(zoom),
        hexagons: boundsHexes,
      });
    }
  };

  useEffect(() => {
    if (debouncedHexagonClicked) {
      toggleShowLeftColumn(true);

      if (
        debouncedHexagonClicked.properties.buttons &&
        debouncedHexagonClicked.properties.buttons.length > 0
      ) {
        let hexagonButtonsOrdered = orderByClosestToCenter(filters.where?.center, debouncedHexagonClicked.properties.buttons)
        store.emit(
          new UpdateListButtons(
            hexagonButtonsOrdered
          ),
        );
      }
    } else {
      store.emit(new UpdateListButtons(boundsFilteredButtons));
    }
  }, [debouncedHexagonClicked]);

  return {
    handleBoundsChange,
    setHexagonsToFetch,
    setHexagonClicked,
    hexagonClicked,
    isRedrawingMap,
    h3TypeDensityHexes,
  };
}

const orderByClosestToCenter = (center, buttons) => {
  function buttonDistance(buttonA, buttonB) {
    return buttonA.distance - buttonB.distance;
  }

  if(!center)
  {
    return buttons;
  }
  const buttonsDistance = buttons.map((button) => {
    const distance = getDistance({latitude: button.latitude, longitude: button.longitude}, {
      latitude: center[0], longitude: center[1]
    })
    return {...button, distance}
  })

  return buttonsDistance.sort(buttonDistance)
}