import { useEffect, useRef } from 'react';
import { PhoneControl } from '../phone/PhoneControl';

// inspired by https://developer.salesforce.com/docs/atlas.en-us.api_cti.meta/api_cti/sforce_api_cti_onclicktodial_lex.htm
interface ClickToDialPayload {
  number: string;
  recordId: string;
  recordName: string;
  objectType: string;
  personAccount: boolean;
  accountId?: string;
  contactId?: string;
}

interface EnableClickToDialResponse {
  success: boolean;
  returnValue: any;
  errors: Array<any>;
}

interface SearchAndScreenPopResponse {
  success: boolean;
  returnValue: any;
  errors: Array<any>;
}

interface ScreenPopResponse {
  success: boolean;
  returnValue: null;
  errors: Array<any>;
}

const loadScript = async (url: string): Promise<void> =>
  new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const node = document.getElementsByTagName('script')[0];

    script.src = url;
    script.async = true;
    script.onerror = reject;
    script.type = 'text/javascript';

    script.onload = (event: Event) => {
      resolve();
    };

    if (node && node.parentNode) {
      node.parentNode.insertBefore(script, node);
    }
  });

export const useSalesforceOpenCti = (phone: PhoneControl | undefined) => {
  const sforce = useRef<any>(undefined);

  useEffect(() => {
    if (!phone) {
      return;
    }

    if (!window.location.ancestorOrigins) {
      console.log('Salesforce OpenCTI document is not framed, aborting');

      return;
    }

    const salesforceBaseUrl = window.location.ancestorOrigins[0];

    if (!salesforceBaseUrl) {
      console.log('Salesforce OpenCTI found stand-alone environment, stop initialising');
      return;
    }

    const initialize = async () => {
      await loadScript(`${salesforceBaseUrl}/support/api/49.0/lightning/opencti.js`);

      console.log('Salesforce OpenCTI plug-in loaded');

      if ((window as any).sforce) {
        console.log('Salesforce OpenCTI found on window object, register listener');

        sforce.current = (window as any).sforce;

        sforce.current.opencti.onClickToDial({
          listener: (payload: ClickToDialPayload) => {
            console.log(`Salesforce OpenCTI click-to-call with number ${payload.number}`);

            phone
              .connect(payload.number)
              .then((call) => {
                console.log(`Salesforce OpenCTI started outbound with ${call.id}`);
              })
              .catch((error) => console.log(error));
          },
        });

        sforce.current.opencti.enableClickToDial({
          callback: (response: EnableClickToDialResponse) => {
            if (response.success) {
              console.log('Salesforce OpenCTI enableClickToDial called successfully');
            } else {
              console.error('Salesforce OpenCTI enableClickToDial call failed', response.errors);
            }
          },
        });
      }
    };

    initialize();
  }, [phone]);

  const doScreenPop = (number: string) => {
    if (!sforce.current) {
      console.log('Salesforce OpenCTI ignore screen pop, sforce not found on window');
      return;
    }

    console.log(`Salesforce OpenCTI query for phone number ${number}`);

    sforce.current.opencti.searchAndScreenPop({
      searchParams: number,
      queryParams: null,
      callType: sforce.current.opencti.CALL_TYPE.OUTBOUND,
      deferred: false,
      callback: (response: SearchAndScreenPopResponse) => {
        console.log(`Salesforce OpenCTI query record success: ${response.success}`);

        const record = Object.keys(response.returnValue)[0];

        if (record) {
          openRecord(record);
        }
      },
    });

    const openRecord = (recordId: string) => {
      if (!sforce.current) {
        console.log('Salesforce OpenCTI ignore screen pop, sforce not found on window');
        return;
      }

      console.log(`Salesforce OpenCTI open record ${recordId}`);

      sforce.current.opencti.screenPop({
        type: sforce.current.opencti.SCREENPOP_TYPE.SOBJECT,
        params: { recordId: recordId },
        callback: function (response: ScreenPopResponse) {
          console.log(`Salesforce OpenCTI open record result ${response.success}`);
        },
      });
    };
  };

  return doScreenPop;
};
