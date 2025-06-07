import * as awsx from "@pulumi/awsx";
import { cluster } from "./cluster";

// serve para os protocolocos HTTP e HTTPs
export const appLoadBalancer = new awsx.classic.lb.ApplicationLoadBalancer("app-lb", {
  securityGroups: cluster.securityGroups
})

// serve outros protocolos com TCP e UDP
export const networkLoadBalancer = new awsx.classic.lb.NetworkLoadBalancer("net-lb", {
  subnets: cluster.vpc.publicSubnetIds
})
