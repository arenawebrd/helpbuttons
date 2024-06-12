import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { CustomHttpException } from '@src/shared/middlewares/errors/custom-http-exception.middleware';
import { ErrorName } from '@src/shared/types/error.list';
import { NetworkService } from '../network/network.service';

@Injectable()
export class GeoService {
  constructor(
    private readonly httpService: HttpService,
    private readonly networkService: NetworkService,
  ) {}

  async search(address: string) {
    try {
      return this.komoot(address);
    } catch (err) {
      return [];
    }
  }

  async reverse(lat: string, lng: string) {
    try {
      return this.komootReverse(lat, lng);
    } catch (err) {
      console.log(err)
      return [];
    }
  }

  // // photon.komoot.io/reverse?lon=10&lat=52
  // async geokeo(address: string) {
  //   const url = `https://geokeo.com/geocode/v1/reverse.php?q=${address}&api=${configs().geokeo}`;
  //   return firstValueFrom(this.httpService.get(url)).then(
  //     (result) => {
  //       // @ts-ignore
  //       if (!result.data.results) {
  //         throw new CustomHttpException(ErrorName.geoCodingError);
  //       }
  //       let addressesFound = [];
  //       // @ts-ignore
  //       result.data.results.map((place) => {
  //         const name = place.address_components.street
  //           ? place.address_components.street
  //           : place.address_components.name;
  //         addressesFound.push({
  //           formatted: `${name}, ${place.address_components.district}, ${place.address_components.country}`,
  //           geometry: place.geometry,
  //         });
  //       });
  //       return addressesFound;
  //     },
  //   );
  // }

  // async opencage(address: string) {
  //   const url = `https://api.opencagedata.com/geocode/v1/json?q=${address}&key=${config.mapifyApiKey}`;
  //   const { data } = await firstValueFrom(this.httpService.get(url));
  //   return data;
  // }

  async komoot(address: string) {
    return await this.networkService
      .findDefaultNetwork()
      .then(async (network) => {
        let addressesFound = [];
        // @ts-ignore
        // const url = `https://photon.komoot.io/api/?q=${address}&lat=${network.exploreSettings.center[0]}&lon=${network.exploreSettings.center[1]}&limit=5`;
        const url = `https://photon.komoot.io/api/?q=${address}&limit=5`;
        const uri = encodeURI(url);
        return await firstValueFrom(this.httpService.get(uri)).then(
          (result) => {
            if (!result.data.features) {
              return [];
            }
            result.data.features.map((place) => {
              addressesFound.push(this.komootResponseToPlace(place));
            });
            return addressesFound;
          },
        );
      })
      .catch((err) => {
        throw new CustomHttpException(ErrorName.geoCodingError);
      });
  }

  async komootReverse(lat: string, lng: string) {
    const url = encodeURI(
      `https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}`,
    );
    return await firstValueFrom(this.httpService.get(url))
      .then((result) => {

        if(result.data.features && result.data.features.length > 0)
        {
          return this.komootResponseToPlace(result.data.features[0])
        }
        return {formatted: 'Unknown place', formatted_city: 'Unknown place'}
      })
      .catch((err) => {
        console.log(url)
        console.log(err)
        return false
      });
  }

  komootResponseToPlace(place: any) {
    const name = place.properties.name
      ? `${place.properties.name}, `
      : '';
    const street = place.properties.street
      ? `${place.properties.street}, `
      : '';
    const housenumber = place.properties.housenumber
      ? `${place.properties.housenumber}, `
      : '';
    const city = place.properties.city
      ? `${place.properties.city}, `
      : '';
    const country = place.properties.country
      ? `${place.properties.country}`
      : '';
    return {
      formatted: `${name}${street}${housenumber}${city}${country}`,
      formatted_city: `${city}${country}`,
      geometry: {
        lat: place.geometry.coordinates[1],
        lng: place.geometry.coordinates[0],
      },
      id: place.osmid,
    };
  }
}
