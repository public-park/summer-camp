import { Call } from '../../models/Call';
import VoiceResponse = require('twilio/lib/twiml/VoiceResponse');
import { getCallbackUrl } from '../../controllers/callback/PhoneHelper';

const createConferenceTwiml = (
  call: Call,
  label: string,
  jitterBufferSize?: VoiceResponse.ConferenceAttributes['jitterBufferSize']
) => {
  let twiml = new VoiceResponse();

  const dial = twiml.dial({ callerId: call.from });

  const conferenceOptions: VoiceResponse.ConferenceAttributes = {
    jitterBufferSize: jitterBufferSize,
    endConferenceOnExit: true,
    statusCallbackEvent: ['join'],
    statusCallback: getCallbackUrl(
      `status-callback/accounts/${call.accountId}/calls/${call.id}/conference/${call.direction}`
    ),
    participantLabel: label,
  };

  dial.conference(conferenceOptions, call.id);

  return twiml.toString();
};

const createRejectTwiml = () => {
  let twiml = new VoiceResponse();

  twiml.say(
    {
      language: 'en-US',
      voice: 'Polly.Salli-Neural',
    },
    'The person you try to call is currently not available'
  );

  return twiml.toString();
};

const createEnqueueTwiml = (call: Call, label: string) => {
  let twiml = new VoiceResponse();

  const dial = twiml.dial();
  // VoiceResponse.ConferenceAttributes
  const options: any = {
    endConferenceOnExit: true,
    participantLabel: label,
  };

  dial.conference(options, call.id);

  return twiml.toString();
};

export { createEnqueueTwiml, createConferenceTwiml, createRejectTwiml };
