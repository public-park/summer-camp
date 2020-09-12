## Salesforce Integration

This project comes with a basic integration for Salesforce OpenCTI.

### Before You Get Started

Install the project and setup the account once by registering.

### Enable the Salesforce ReactJS Hook

You find the source code in `/src/hooks/useSalesforceOpenCti.ts`; without any modification the component supports:

- open a Salesforce contact if a call comes in
- **click-to-call**, click any number in Salesforce and the phone will instantly dial it

Please note the phone number format must be a valid international format, for examle **+42...** .

### Add the Salesforce Hook to the Application

Open `src/ApplicationProviderContext.ts`, this file provides the context to all child components.

Import the Salesforce component with

`import { useSalesforceOpenCti } from './hooks/useSalesforceOpenCti';`

Define the `doSceenPop` function, this will automatically register the hook as `onClickToDial` handler on [Salesforce Open CTI](https://developer.salesforce.com/docs/atlas.en-us.api_cti.meta/api_cti/sforce_api_cti_onclicktodial_lex.htm).

`const doScreenPop = useSalesforceOpenCti(phone);`

Upon incoming phone calls we want to trigger the component. Modify the incoming call listener and add the doScreenPop method.

```typescript
phone.onIncomingCall((call) => {
    setCall(call);
    
    */ Salesforce OpenCTI */
    doScreenPop(call.phoneNumber);
});
```

You are all set, build the project and deploy it on your prefered hosting provider.