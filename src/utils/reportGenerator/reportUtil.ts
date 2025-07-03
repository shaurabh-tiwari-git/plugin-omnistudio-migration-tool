import { OmnistudioOrgDetails } from '../orgUtils';
import { FilterGroupParam, OrgParam, ReportDataParam } from './reportInterfaces';

export function createRowDataParam(
  key: string,
  value: string,
  searchable: boolean,
  rowspan: number,
  colspan: number,
  isHref: boolean,
  uri?: string,
  title?: string | string[],
  customClass?: string
): ReportDataParam {
  if (title && Array.isArray(title)) {
    title = title.filter((t) => t?.trim?.());
  }

  return {
    key,
    value,
    title: title || value?.toString() || '',
    searchable,
    rowspan,
    colspan,
    isHref,
    uri,
    customClass: customClass || '',
  };
}

export function getOrgDetailsForReport(omnistudioOrgDetails: OmnistudioOrgDetails): OrgParam {
  return {
    name: omnistudioOrgDetails.orgDetails.Name,
    id: omnistudioOrgDetails.orgDetails.Id,
    namespace: omnistudioOrgDetails.packageDetails.namespace,
    dataModel: omnistudioOrgDetails.dataModel,
  };
}

export function createFilterGroupParam(label: string, key: string, filters: string[]): FilterGroupParam {
  return {
    label,
    key,
    filters: filters.map((filter) => ({
      label: filter,
    })),
  };
}
