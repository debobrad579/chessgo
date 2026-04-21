package appmetrics

import (
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
)

var GamesTotal = promauto.NewCounterVec(
	prometheus.CounterOpts{
		Name: "games_total",
		Help: "Total number of games played.",
	},
	[]string{"result", "result_reason"},
)
