import { Router } from 'next/router';
import { map, tap, catchError } from 'rxjs/operators';
import { produce } from 'immer';

import { WatchEvent } from 'store/Event';
import { UpdateEvent } from '../store/Event';

import { alertService } from 'services/Alert';
import { ButtonService } from 'services/Buttons';
import { Bounds } from 'leaflet';
import { of } from 'rxjs';
import { isHttpError } from 'services/HttpService';
import { GlobalState } from 'pages';
import { Button } from 'shared/entities/button.entity';
import { GeoService } from 'services/Geo';
import { HttpStatus } from 'services/HttpService/http-status.enum';
import { errorsList, ErrorText } from 'shared/types/errorsList';

export interface ExploreState {
  mapBondsButtons: Button[];
  draftButton: Button;
  currentButton: Button;
}

export const exploreInitial = {
  mapBondsButtons: [],
  draftButton: null,
  currentButton: null
}

export class FindButtons implements WatchEvent {
  public constructor(private networkId: string, private bounds: Bounds) {}

  public watch(state: GlobalState) {
    return ButtonService.find(this.networkId, this.bounds).pipe(
      map((buttons) => new ButtonsFound(buttons)),
    );
  }
}

export class ButtonsFound implements UpdateEvent {
  public constructor(private buttons: Button[]) {}

  public update(state: GlobalState) {
    return produce(state, newState => {
      newState.explore.mapBondsButtons = this.buttons;
    });
  }
}

export class FindAddress implements WatchEvent {
  public constructor(private q: string, private onSuccess, private onError) {}

  public watch(state: GlobalState) {
    const t =  GeoService.findPromise(this.q)
    .then((place) =>
      this.onSuccess(place)  
    )
    .catch((error) => {
      this.onError(error)
    })
  }
}

export class CreateButton implements WatchEvent {
  public constructor(
    private button: Button,
    private networkId: string,
    private onSuccess,
    private onError
  ) {}
  public watch(state: GlobalState) {
    return ButtonService.new(this.button, this.networkId).pipe(
      map((buttonData) => {
        this.onSuccess();
      }),
      catchError((error) => {
        let err = error.response;
        
        if (isHttpError(err) && err.statusCode === 401) { // Unauthorized
          this.onError("unauthorized", this.button);
        } else if (err.statusCode === 400 && err.message === "validation-error") {
          this.onError(" validations error")
        } else {
          throw error;
        }
        return of(undefined);
      })
    );
  }
}

export class SaveButtonDraft implements UpdateEvent {
  public constructor(private button: Button) {}

  public update(state: GlobalState) {
    return produce(state, newState => {
      newState.explore.draftButton = this.button;
    });
  }
}

export class FindButton implements WatchEvent {
  public constructor(private buttonId: string) {}

  public watch(state: GlobalState) {
    return ButtonService.findById(this.buttonId).pipe(
      map((button) => new ButtonFound(button)),
    );
  }
}

export class ButtonFound implements UpdateEvent {
  public constructor(private button: Button) {}

  public update(state: GlobalState) {
    return produce(state, newState => {
      newState.explore.currentButton = this.button;
    });
  }
}

export class ClearCurrentButton implements UpdateEvent {
  public constructor() {}

  public update(state: GlobalState) {
    return produce(state, newState => {
      newState.explore.currentButton = null;
    });
  }
}
export class SetAsCurrentButton implements WatchEvent {
  public constructor(private buttonId: string) {}

  public watch(state: GlobalState) {
    if (this.buttonId == state.explore.currentButton?.id) {
      return of(undefined);
    }
    state.explore.mapBondsButtons.filter((button) => {
      if(button.id == this.buttonId)
      {
        return new ButtonFound(button)
      }
    })
    return ButtonService.findById(this.buttonId).pipe(
      map((button) => new ButtonFound(button)),
    );
  }
}

export class ButtonDelete implements WatchEvent {
  public constructor(private buttonId: string, private onSuccess, private onError) {}

  public watch(state: GlobalState) {
    return ButtonService.delete(this.buttonId).pipe(
      map((rowsAffected) => {
        console.log(rowsAffected)
        if (rowsAffected > 0){
          this.onSuccess()
        }else {
          this.onError('error-deleting')
        }
      }),
      catchError((error) =>
      {
        const err = error.response;
        console.log(err)
        if (
          isHttpError(err) &&
          err.statusCode === HttpStatus.FORBIDDEN
        ) {
          console.log('catch 403')
          // do nothing, its ok! it will jump to the setup!
          const errorText: ErrorText[] = errorsList.filter(({name}) => err.message == name)
          // console.log(errorText)
          if (errorText && errorText.length > 0)
          {
            console.log(errorText[0].caption)
            this.onError(errorText[0].caption);
          }else{
            this.onError(error.message);
          }
          
        }
        console.log('ups')
        return of(undefined);
        console.log(error)
        this.onError(JSON.stringify(error))
        return of(undefined)
      })
    );
  }
}
