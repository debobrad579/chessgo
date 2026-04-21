package appmetrics

import (
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
)

var NewUsersTotal = promauto.NewCounter(
	prometheus.CounterOpts{
		Name: "new_users_total",
		Help: "Total number of new users.",
	},
)
