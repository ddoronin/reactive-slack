import React from 'react';
import { switchMap } from "rxjs/operators";
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { connect, RTMMessage, OAuthRequest, auth, channel } from "../data/slack-api";
import { Subject } from "rxjs/internal/Subject";
import Slack from "../widgets/Slack";

export interface Slack {
    rtm$: Subject<RTMMessage>;
    connect(authConfig: OAuthRequest): void;
}

export class MySlack implements Slack {
    public rtm$: Subject<RTMMessage> = new BehaviorSubject<RTMMessage>({type: 'disconnected', event_ts: ''});

    public connect(authConfig: OAuthRequest) {
        auth(authConfig).pipe(
            switchMap(oauth => connect({ token: oauth.access_token}))
        ).subscribe(config => {
            if (config.ok && config.url) {
                channel({ url: config.url }).subscribe(this.rtm$);
                return;
            }
            throw new Error('Cannot connect to RTM.');
        });
    }
}

export const SlackContext = React.createContext(new MySlack());
