////////services/location-service/main.go``go

package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
)

var ctx = context.Background()
var rdb *redis.Client

type Location struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
	UserID    string  `json:"userId"`
}

type NearbyUser struct {
	UserID   string  `json:"userId"`
	Distance float64 `json:"distance"`
}

func main() {
	// Initialize Redis
	rdb = redis.NewClient(&redis.Options{
		Addr: os.Getenv("REDIS_URL"),
	})

	router := gin.Default()

	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok", "service": "location-service"})
	})

	router.POST("/api/v1/location/update", updateLocation)
	router.GET("/api/v1/location/nearby", getNearbyUsers)

	port := os.Getenv("LOCATION_SERVICE_PORT")
	if port == "" {
		port = "9000"
	}

	log.Printf("📍 Location Service running on port %s", port)
	router.Run(":" + port)
}

func updateLocation(c *gin.Context) {
	var loc Location
	if err := c.BindJSON(&loc); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request"})
		return
	}

	// Store location in Redis using GEOADD
	err := rdb.GeoAdd(ctx, "user_locations", &redis.GeoLocation{
		Name:      loc.UserID,
		Longitude: loc.Longitude,
		Latitude:  loc.Latitude,
	}).Err()

	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to update location"})
		return
	}

	// Set expiry for location (1 hour)
	rdb.Expire(ctx, "user_locations", 3600)

	c.JSON(200, gin.H{"message": "Location updated successfully"})
}

func getNearbyUsers(c *gin.Context) {
	userId := c.Query("userId")
	radiusKm := c.DefaultQuery("radius", "50")

	// Get user's current location
	locations, err := rdb.GeoPos(ctx, "user_locations", userId).Result()
	if err != nil || len(locations) == 0 {
		c.JSON(404, gin.H{"error": "User location not found"})
		return
	}

	userLoc := locations[0]

	// Find nearby users using GEORADIUS
	results, err := rdb.GeoRadius(ctx, "user_locations", userLoc.Longitude, userLoc.Latitude, &redis.GeoRadiusQuery{
		Radius:    parseFloat(radiusKm),
		Unit:      "km",
		WithDist:  true,
		Count:     100,
		Sort:      "ASC",
	}).Result()

	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to find nearby users"})
		return
	}

	var nearbyUsers []NearbyUser
	for _, result := range results {
		if result.Name != userId {
			nearbyUsers = append(nearbyUsers, NearbyUser{
				UserID:   result.Name,
				Distance: result.Dist,
			})
		}
	}

	c.JSON(200, gin.H{"users": nearbyUsers})
}

func parseFloat(s string) float64 {
	var f float64
	json.Unmarshal([]byte(s), &f)
	return f
}