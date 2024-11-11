import fetch from "node-fetch";
import type Flextime from "../models/flextime";
import type ResourceAllocationModel from "../models/resourceAllocation";
import type Phase from "@database/models/phase";
import type WorkHours from "@database/models/workHours";
import WorkHoursModel from "@database/models/workHours";
import {Promise} from "@sinclair/typebox";
import * as process from "node:process";
import { FilterUtilities } from "src/libs/filter-utils";

/**
 * Interface for a SeveraApiService.
 */
export interface SeveraApiService {
  getFlextimeBySeveraGuid: (severaGuid: string, eventDate: string) => Promise<Flextime>;
  getResourceAllocation: (severaGuid: string) => Promise<ResourceAllocationModel[]>;
  getPhasesBySeveraProjectGuid: (severaProjectGuid: string) => Promise<Phase[]>;
  // getWorkHoursBySeveraUserGuid: (severaUserGuid: string) => Promise<WorkHours[]>;
  getWorkHoursBySeveraUserGuid: ( severaProjectGuid?: string, severaUserGuid?: string ) => Promise<WorkHours[]>;
}

/**
 * Creates SeveraApiService
 */
export const CreateSeveraApiService = (): SeveraApiService => {
  const baseUrl: string = process.env.SEVERA_DEMO_BASE_URL;

  return {
    /**
     * Gets flextime by userGUID and eventDate
     */
    getFlextimeBySeveraGuid: async (severaGuid: string, eventDate: string) => {
      const url: string = `${baseUrl}/v1/users/${severaGuid}/flextime?eventdate=${eventDate}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${await getSeveraAccessToken()}`,
          "Client_Id": process.env.SEVERA_DEMO_CLIENT_ID,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch flextime: ${response.status} - ${response.statusText}`,
        );
      }

      return response.json();
    },

    /** 
     * Get resource allocation by userGUID 
     */
    getResourceAllocation: async (severaGuid: string) => {
        const url: string = `${baseUrl}/v1/users/${severaGuid}/resourceallocations/allocations`;
        const response = await fetch(url,{
            method: "GET",
            headers: {
                Authorization: `Bearer ${await getSeveraAccessToken()}`,
                "Client_Id": process.env.SEVERA_DEMO_CLIENT_ID,
                "Content-Type": "application/json",
            },
        });
        if (!response.ok) {
            throw new Error(
                `Failed to fetch resource allocation: ${response.status} - ${response.statusText}`,
            );
        }
        const resourceAllocations = await response.json();
        const transformedResourceAllocations: ResourceAllocationModel[] = resourceAllocations.map((item:any) => ({
          severaProjectGuid: item.guid,
          allocationHours: item.allocationHours,
          calculatedAllocationHours: item.calculatedAllocationHours,
          phase: {
              severaPhaseGuid: item.phase?.guid,
              name: item.phase?.name,
          },
          users: {
              severaUserGuid: item.user?.guid,
              name: item.user?.name,
          },
          projects: {
              severaProjectGuid: item.project?.guid,
              name: item.project?.name,
              isInternal: item.project?.isInternal,
          },
      }))
        return transformedResourceAllocations;
    },

    /**
     * Gets phases by userGUID
     */
    getPhasesBySeveraProjectGuid: async (severaProjectGuid: string) : Promise<Phase[]> => {
      const url: string = `${baseUrl}/v1/projects/${severaProjectGuid}/phaseswithhierarchy`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${await getSeveraAccessToken()}`,
          "Client_Id": process.env.SEVERA_DEMO_CLIENT_ID,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch phases: ${response.status} - ${response.statusText}`,
        );
      }

      const phases = await response.json();

      return phases.map((item: any) => ({
        severaPhaseGuid: item.guid,
        name: item.name,
        isCompleted: item.isCompleted,
        workHoursEstimate: item.workHoursEstimate,
        startDate: item.startDate,
        deadLine: item.deadLine,
        project: {
          severaProjectGuid: item.project.guid,
          name: item.project.name,
          isClosed: item.project.isClosed,
        },
      }));
    },

    /**
     * Gets work hours by userGUID
     */
    getWorkHoursBySeveraUserGuid: async (severaProjectGuid?:string, severaUserGuid?: string) : Promise<WorkHours[]> => {
      // const url: string = `${baseUrl}/v1/users/${severaUserGuid}/workhours`;
      // const url: string = `${baseUrl}/v1/workhours`;

    

      // const url: string = severaProjectGuid || severaUserGuid 
      // // ? `${baseUrl}/v1/projects/${severaProjectGuid}/users/${severaUserGuid}/workhours`
      // ? `${baseUrl}/v1/projects/${severaProjectGuid}/workhours`
      // : severaProjectGuid
      // ? `${baseUrl}/v1/projects/${severaProjectGuid}/workhours`
      // : severaUserGuid
      // ? `${baseUrl}/v1/users/${severaUserGuid}/workhours`
      // : `${baseUrl}/v1/workhours`;

      const url: string = severaUserGuid 
        ? `${baseUrl}/v1/users/${severaUserGuid}/workhours`  // Use user URL if user GUID is provided
        : severaProjectGuid 
        ? `${baseUrl}/v1/projects/${severaProjectGuid}/workhours`  // Use project URL if project GUID is provided
        : `${baseUrl}/v1/workhours`;  // Default URL if neither is provided

      console.log("severaProjectGuid", severaProjectGuid)
      console.log("severaUserGuid", severaUserGuid)


      console.log("url", url)
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${await getSeveraAccessToken()}`,
          "Client_Id": process.env.SEVERA_DEMO_CLIENT_ID,
          "Content-Type": "application/json",
        },
      });

      // if(severaProjectGuid){
      //   response.filter((workHours) => {
      //     return workHours.project.guid === severaProjectGuid
      //   })
      // }

      if (!response.ok) {
        throw new Error(
          `Failed to fetch work hours: ${response.status} - ${response.statusText}`,
        );
      }

      const workHours = await response.json();



  

      const filteredWorkHours = workHours.filter(workHours => {
        return FilterUtilities.filterByProjectSevera(workHours.severaUserGuid)
      })
      // Cant filter with 2 parameters yet
      // console.log("filteredWorkHours", filteredWorkHours)

      return filteredWorkHours.map(workHours => {
        return {
          severaWorkHoursGuid: workHours.guid,
          user: {
            severaUserGuid: workHours.user.guid,
            name: workHours.user.name,
          },
          project: {
            severaProjectGuid: workHours.project.guid,
            name: workHours.project.name,
            isClosed: workHours.project.isClosed,
          },
          // phase: {
          //   severaPhaseGuid: workHours.phase.guid,
          //   name: workHours.phase.name,
          // },
          description: workHours.description,
          eventDate: workHours.eventDate,
          quantity: workHours.quantity,
          startTime: workHours.startTime,
          endTime: workHours.endTime
        }
      })

      
      


      // return workHours.map((item: any) => ({
      //   severaWorkHoursGuid: item.guid,
      //   user: {
      //     severaUserGuid: item.user.guid,
      //     name: item.user.name,
      //   },
      //   project: {
      //     severaProjectGuid: item.project.guid,
      //     name: item.project.name,
      //     isClosed: item.project.isClosed,
      //   },
      //   phase: {
      //     severaPhaseGuid: item.phase.guid,
      //     name: item.phase.name
      //   },
      //   description: item.description,
      //   eventDate: item.eventDate,
      //   quantity: item.quantity,
      //   startTime: item.startTime,
      //   endTime: item.endTime,
      // }));


    },
  };
};

/**
 * Gets Severa access token
 *
 * @returns Access token as string
 */
const getSeveraAccessToken = async (): Promise<string> => {
  
//   if (process.env.IS_OFFLINE) {
//     return "test-token";
//   }
  
  const url: string = `${process.env.SEVERA_DEMO_BASE_URL}/v1/token`;
  const client_Id: string = process.env.SEVERA_DEMO_CLIENT_ID;
  const client_Secret: string = process.env.SEVERA_DEMO_CLIENT_SECRET;

  const requestBody = {
    client_id: client_Id,
    client_secret: client_Secret,
    scope: "projects:read, resourceallocations:read, hours:read",
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to get Severa access token: ${response.status} - ${response.statusText}`,
      );
    }
    const data = await response.json();
    return data.access_token;
  } catch (error) {
    throw new Error(`Failed to get Severa access token: ${error.message}`);
  }
};