import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Capacitor, CapacitorHttp } from '@capacitor/core';
import { BehaviorSubject, catchError, from, Observable, throwError } from 'rxjs';
import * as XLSX from 'xlsx';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  token: string = "";
  count: number = 0;
  canProceed: boolean = true;
  allJobDetails: any[] = [];
  appliedJobDetails: any[] = [];
  chatResponseJobDetails: any[] = [];
  dashboardOutResult: any = {};
  errorMsg: any[] = [];
  dailyCount: number = 0;
  monthlyCount: number = 0;
  isLoggingOut: boolean = false;

  private chatResponseInSubject = new BehaviorSubject<any>(null);
  chatResponseIn$ = this.chatResponseInSubject.asObservable();

  constructor(private http: HttpClient) { }
  async beginProcess(bodyData: any) {
    const url = "https://www.naukri.com/cloudgateway-mynaukri/resman-aggregator-services/v1/users/self/fullprofiles";

    const options = {
      url: url,
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
        appid: "105",
        clientid: "d3skt0p",
        systemid: "Naukri",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "x-http-method-override": "PUT",
        Authorization: `Bearer ${this.token}`,
      },
      data: bodyData.profile[0]
    };

    try {
      const response = await CapacitorHttp.request(options);
      console.log('Response:', response);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async login(credentials: any) {
    const options = {
      url: "https://www.naukri.com/central-login-services/v1/login",
      headers: {
        "Content-Type": "application/json",
        "accept": "application/json",
        "appid": "103",
        "clientid": "d3skt0p",
        "systemid": "jobseeker",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      },
      data: credentials
    };


    console.log("Login options:", options);
    try {
      const response = await CapacitorHttp.post(options);
      this.token = response?.data?.cookies[0]?.value;
    } catch (error) {
      console.error("Login failed:", error);
    }
  }

  buildJobSearchUrl(searchParams: any) {
    let params = '';
    let { skills, experience, location, jobAge, preferedTitle, pageNumber } = searchParams;
    let base = "https://www.naukri.com/jobapi/v3/search";

    let payload: any = {
      noOfResults: 20,
      urlType: "search_by_key_loc",
      searchType: "adv",
      location: location.toLowerCase(),
      keyword: skills.toLowerCase(),
      sort: "r",
      pageNo: pageNumber,
      experience: experience,
      jobAge: jobAge,
      k: skills.toLowerCase(),
      l: location.toLowerCase(),
      nignbevent_src: "jobsearchDeskGNB",
      seoKey: location
        ? (skills.split(' ').length > 1
          ? `${skills.split(' ')[0].toLowerCase()}-${skills.split(' ')[1].toLowerCase()}-jobs-in-${location.toLowerCase()}`
          : `${skills.toLowerCase()}-jobs-in-${location.toLowerCase()}`)
        : `${skills.toLowerCase()}-jobs`,
      src: "jobsearchDesk",
      latLong: "",
    };

    let queryParts: string[] = [];

    for (let key in payload) {
      const value = payload[key];

      // Skip undefined, null, or empty strings (unless key is latLong)
      if (value === undefined || value === null || (value === '' && key !== 'latLong')) {
        continue;
      }

      // Special case for 'src'
      if (key === "src" && payload['jobAge']) {
        queryParts.push(`src=cluster`);
      } else {
        queryParts.push(`${key}=${value}`);
      }

      // Special case for 'nignbevent_src'
      if (key === "nignbevent_src") {
        if (payload['experience'] !== undefined && payload['experience'] !== null) {
          queryParts.push(`experience=${(payload['experience'])}`);
        }

        if (payload['jobAge'] !== undefined && payload['jobAge'] !== null) {
          queryParts.push(`jobAge=${(payload['jobAge'])}`);
        }
      }
    }

    params = queryParts.join('&');

    return `${base}?${params}`;


  }

  async searchJobs(searchParams: any) {
    let { skills, experience, location, jobAge, preferedTitle } = searchParams;


    let preTitle = preferedTitle;
    let pageNumber = 1;
    searchParams['pageNumber'] = pageNumber;
    this.count = 0;
    this.allJobDetails = [];
    this.appliedJobDetails = [];
    this.chatResponseJobDetails = [];


    while (this.canProceed && true) {
      let url = this.buildJobSearchUrl(searchParams);

      const options = {
        url: url,
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          appid: "109",
          clientid: "d3skt0p",
          systemid: "Naukri",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          Authorization: `Bearer ${this.token}`,
          nkparam: "==",
        }
      };

      try {
        const response = await CapacitorHttp.get(options);
        console.log("Response received for page", pageNumber);

        if (response?.data?.jobDetails && response.data.jobDetails.length > 0) {

          let jobDetails = response.data.jobDetails;
          let sid = response?.data?.sid;

          for (let i = 0; i < jobDetails?.length; i++) {
            const job = jobDetails[i];
            const jobApplyUrl = `https://www.naukri.com/jobapi/v4/job/${job.jobId
              }?microsite=y&src=jobsearchDesk&sid=${sid}&xp=${i + 1
              }&px=${pageNumber}&nignbevent_src=jobsearchDeskGNB`;

            const options = {
              url: jobApplyUrl,
              headers: {
                "Content-Type": "application/json",
                accept: "application/json",
                appid: "121",
                clientid: "d3skt0p",
                systemid: "Naukri",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                Authorization: `Bearer ${this.token}`,
                NKparam: "==",
                cookie: "nauk_at",
              }
            };

            const responseJobApply = await CapacitorHttp.get(options);
            let resJobDetails = responseJobApply?.data?.jobDetails;
            const jobTitle = resJobDetails?.title?.toLowerCase();

            const hasMatch = preTitle.some((x: string) => jobTitle.includes(x.toLowerCase()) || resJobDetails?.keySkills?.preferred.some((y: any) => y.label.toLowerCase().includes(x)));
            if (resJobDetails) {
              if (!resJobDetails?.applyRedirectUrl
                && hasMatch) {
                let jobApply = `https://www.naukri.com/cloudgateway-workflow/workflow-services/apply-workflow/v1/apply`;

                let obj = {
                  applySrc: "cluster",
                  applyTypeId: "107",
                  chatBotSDK: true,
                  closebtn: "y",
                  crossdomain: true,
                  flowtype: "show",
                  jquery: 1,
                  logStr: resJobDetails?.logStr,
                  mandatory_skills: resJobDetails?.keySkills?.preferred.map(
                    (x: any) => x.label
                  ),
                  optional_skills: resJobDetails?.keySkills?.other.map(
                    (x: any) => x.label
                  ),
                  rdxMsgId: "",
                  sid: resJobDetails?.logStr.split("-")[8],
                  strJobsarr: [resJobDetails.jobId],
                };
                let headers = {
                  url: jobApply,
                  headers: {
                    "Content-Type": "application/json",
                    accept: "application/json",
                    appid: "121",
                    clientid: "d3skt0p",
                    systemid: "Naukri",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                    Authorization: `Bearer ${this.token}`,
                    NKparam: "==",
                    cookie: "nauk_at",
                  },
                  data: obj,
                }


                let applySucc = await CapacitorHttp.post(headers);
                let quotaDetails = applySucc?.data?.quotaDetails
                if (quotaDetails) {
                  this.dailyCount = quotaDetails?.dailyApplied;
                  this.monthlyCount = quotaDetails?.monthlyApplied;
                }
                if (!applySucc?.data?.chatbotResponse) {

                  if (applySucc?.data?.message?.statusCode == 403) {

                    throw new Error("Daily quota of jobs exceeded");
                  }
                  this.appliedJobDetails = this.appliedJobDetails.concat(applySucc.data) as any;

                  this.count = this.count + 1;
                } else if (applySucc?.data?.applyRedirectUrl && applySucc?.data?.chatbotResponse) {
                  this.chatResponseJobDetails = this.chatResponseJobDetails.concat(applySucc?.data) as any;
                } else {
                  this.allJobDetails = this.allJobDetails.concat(applySucc?.data) as any;
                }
              }
            }

          }

          pageNumber++;
        } else {
          console.log("No more job details available.");
          break;
        }
      } catch (error: any) {
        const fullError = {
          message: error?.message,
          responseMessage: error?.response?.data?.message,
          status: error?.response?.status,
          statusText: error?.response?.statusText,
          raw: error
        };

        this.errorMsg.push(JSON.stringify(fullError, null, 2));
        break;
      }
    }
  }


  async exportToExcel() {
    // Convert JSON data to sheets
    const ws1 = XLSX.utils.json_to_sheet(this.appliedJobDetails);
    const ws2 = XLSX.utils.json_to_sheet(this.allJobDetails);
    const ws3 = XLSX.utils.json_to_sheet(this.chatResponseJobDetails);

    // Create a new workbook
    const wb = XLSX.utils.book_new();

    // Append the sheets to the workbook
    XLSX.utils.book_append_sheet(wb, ws1, 'Applied Jobs');
    XLSX.utils.book_append_sheet(wb, ws2, 'Redirect Jobs');
    XLSX.utils.book_append_sheet(wb, ws3, 'Chatbot Response');

    // Write the workbook to an array buffer (this is necessary to generate the file)
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    // Create a blob from the array buffer
    const blob = new Blob([wbout], { type: 'application/octet-stream' });

    // Create a file name
    const fileName = `JobDetails_${new Date().toLocaleDateString()}.xlsx`;

    try {
      // Save the file using Capacitor Filesystem
      await Filesystem.writeFile({
        path: fileName,
        data: await this.convertBlobToBase64(blob),
        directory: Directory.Documents,
        encoding: Encoding.UTF8
      });

      console.log(`File saved to Documents directory as ${fileName}`);

      // Optionally: Open or share the file (this part is platform-specific)
      // For Android, you can use the Sharing API or other native plugins for sharing.
    } catch (error) {
      console.error('Error saving file:', error);
    }
  }

  // Utility function to convert Blob to Base64 (needed for Filesystem write)
  private async convertBlobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  async replyChatBotResponse(cr: any, text: string) {

    let assignValue = {
      appName: cr.currentConversationName,
      channel: "web",
      conversation: cr.currentConversationName,
      deviceType: "WEB",
      domain: "Naukri",
      input: { text: [text], id: ["-1"] },
      status: "Returning",
      utmContent: "",
      utmSource: "",
    }

    let url = 'https://www.naukri.com/cloudgateway-chatbot/chatbot-services/botapi/v5/respond';
    const options = {
      url: url,
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
        clientid: "d3skt0p",
        systemid: "Naukri",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        Authorization: `Bearer ${this.token}`,
      },
      body: assignValue
    }
    let charRes = await CapacitorHttp.post(options);
    this.chatResponseInSubject.next(charRes.data);
    return charRes;
  }


  async getLovData(query: string) {
    const url = `https://taxonomy-suggest.naukri.com/suggest/dsCommonSuggester?limit=8&appId=121&tagThree=&tagFour=&resultField=id,name&subCategory=dsJSsuggestor&query=${query}&category=top&c_query=null&p_query=null&sourceId=4001&vertical=&astext=${query}&callback=_${Date.now()}`;
    const options = {
      url: url,
      headers: {
      }
    };

    let outResult = await CapacitorHttp.get(options);
    let data;
    if (outResult.status == 200) {
      let JsonString = outResult.data.replace(/^.*?\(/, '').replace(/\);?$/, '');
      data = JSON.parse(JsonString);
    }

    return data?.resultList?.top;
  }

  async getDashboardData() {
    const url = "https://www.naukri.com/cloudgateway-mynaukri/resman-aggregator-services/v2/users/self?expand_level=4";

    const options = {
      url: url,
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
        appid: "105",
        clientid: "d3skt0p",
        systemid: "Naukri",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        Authorization: `Bearer ${this.token}`,
      }
    }

    let outResult = await CapacitorHttp.get(options);

    this.dashboardOutResult = outResult.data;
  }

}

