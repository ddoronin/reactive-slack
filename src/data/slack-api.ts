import { ajax } from 'rxjs/ajax';
import { webSocket } from 'rxjs/webSocket';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs/internal/Observable';
import { Subject } from 'rxjs/internal/Subject';

export interface AuthorizeRequest {
    client_id: string;
    scope: string[];
    redirect_url: string;
}

export function authorizeUrl({client_id, scope, redirect_url}: AuthorizeRequest) {
    return `https://slack.com/oauth/authorize?${[
        `client_id=${client_id}`,
        `scope=${encodeURIComponent(scope.join(' '))}`,
        `redirect_url=${encodeURIComponent(redirect_url)}`
    ].join('&')}`;
}

export interface OAuthRequest {
    client_id: string;
    client_secret: string;
    code?: string;
}

export interface OAuthResponse {
    access_token: string;
}

export function auth(req: OAuthRequest): Observable<OAuthResponse> {
    return ajax({
        method: 'POST',
        url: 'https://slack.com/api/oauth.access',
        body: req
    }).pipe(map(res => res.response));
}

export interface RTMConnectRequest {
    token: string;
}

export interface RTMConnectResponse {
    ok: boolean;
    url?: string;
}

export function connect({token}: RTMConnectRequest): Observable<RTMConnectResponse> {
    return ajax({
        method: 'GET',
        url: `https://slack.com/api/rtm.connect?token=${token}`,
    }).pipe(map(res => res.response));
}

export interface RTMRequest {
    url: string;
}

type Disconnected = {
    type: 'disconnected';
    event_ts: string;
}

type Error = {
    type: 'error';
    error: {
        code: string;
        msg: string;
    }
    event_ts: string;
}

type TextMessage = {
    type: 'message';
    ts: string;
    user: string;
    text: string;
    event_ts: string;
}

type UserTyping = {
    type: 'user_typing';
    channel: string;
    user: string;
    event_ts: string;
}

export type RTMMessage = Disconnected | Error | TextMessage | UserTyping;

export function channel({url}: RTMRequest): Subject<RTMMessage> {
    return webSocket(url);
}
