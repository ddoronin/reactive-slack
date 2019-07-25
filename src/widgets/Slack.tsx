import React, { useContext, useState } from 'react';
import { useMountEffect, useRxEffect } from '@reonomy/reactive-hooks';
import { SlackContext } from '../models/slack';
import { authorizeUrl, RTMMessage } from '../data/slack-api';

function token() {
    const match = window.location.search.match(/code=([a-z0-9.]+)&?/m);
    if (match && match.length > 1) {
        return match[1];
    }
    return null;
}

// https://api.slack.com/apps
const client_id = 'xxxxxxxxxxxxxxxxxxxxxxxx';
const client_secret = 'xxxxxxxxxxxxxxxxxxxxxxxx';
const scope = ['identify','read','post','client'];
const redirect_url = 'http://localhost:3000';

export default function Slack() {
    const slack = useContext(SlackContext);
    const [messages, setMessages] = useState<RTMMessage[]>([]);

    useRxEffect(slack.rtm$, rtm => {
        setMessages([rtm, ...messages])
    });

    useMountEffect(() => {
        const code = token();
        if (code) {
            slack.connect({ client_id, client_secret, code });
        }
    });

    return (
        <article>
            <h1>Slack</h1>
            <section>
                <a href={authorizeUrl({client_id, scope, redirect_url})}>authorize</a>
                {messages.map(msg => <div key={msg.event_ts}>
                    <div>type: {msg.type}</div>
                    <div>{JSON.stringify(msg)}</div>
                </div>)}
            </section>
        </article>
    );
}
