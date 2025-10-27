// import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { TrendingDown, TrendingUp } from "lucide-react"

export function SectionCards() {
  return (
    <div className="flex p-6 gap-6">
     <Card className="w-1/4 bg-gradient-to-b from-white to-gray-200">
  <CardHeader>
    <CardDescription>Total Drivers Onboarded</CardDescription>
    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
      250
    </CardTitle>
    <CardAction>
      <Badge variant="outline">
        <TrendingUp />
        +12.5%
      </Badge>
    </CardAction>
  </CardHeader>
  <CardFooter className="flex-col items-start gap-1.5 text-sm">
    <div className="line-clamp-1 flex gap-2 font-medium">
      Trending up this month <TrendingUp className="size-4" />
    </div>
    <div className="text-muted-foreground">
      New drivers registered across all regions
    </div>
  </CardFooter>
</Card>

<Card className="w-1/4 bg-gradient-to-b from-white to-gray-200">
  <CardHeader>
    <CardDescription>Upcoming Reminders</CardDescription>
    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
      1,234
    </CardTitle>
    <CardAction>
      <Badge variant="outline">
        <TrendingDown />
        -20%
      </Badge>
    </CardAction>
  </CardHeader>
  <CardFooter className="flex-col items-start gap-1.5 text-sm">
    <div className="line-clamp-1 flex gap-2 font-medium">
      Down 20% this period <TrendingDown className="size-4" />
    </div>
    <div className="text-muted-foreground">
      Fewer reminders triggered compared to last month
    </div>
  </CardFooter>
</Card>

<Card className="w-1/4 bg-gradient-to-b from-white to-gray-200">
  <CardHeader>
    <CardDescription>Active Accounts</CardDescription>
    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
      45,678
    </CardTitle>
    <CardAction>
      <Badge variant="outline">
        <TrendingUp />
        +12.5%
      </Badge>
    </CardAction>
  </CardHeader>
  <CardFooter className="flex-col items-start gap-1.5 text-sm">
    <div className="line-clamp-1 flex gap-2 font-medium">
      Strong user retention <TrendingUp className="size-4" />
    </div>
    <div className="text-muted-foreground">
      Daily logins remain consistently high
    </div>
  </CardFooter>
</Card>

<Card className="w-1/4 bg-gradient-to-b from-white to-gray-200">
  <CardHeader>
    <CardDescription>Growth Rate</CardDescription>
    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
      4.5%
    </CardTitle>
    <CardAction>
      <Badge variant="outline">
        <TrendingUp />
        +4.5%
      </Badge>
    </CardAction>
  </CardHeader>
  <CardFooter className="flex-col items-start gap-1.5 text-sm">
    <div className="line-clamp-1 flex gap-2 font-medium">
      Steady performance increase <TrendingUp className="size-4" />
    </div>
    <div className="text-muted-foreground">
      Year-over-year growth maintained
    </div>
  </CardFooter>
</Card>

    </div>
  )
}
