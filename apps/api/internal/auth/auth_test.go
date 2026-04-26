package auth_test

import (
	"strings"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/debobrad579/chessgo/internal/auth"
)

func TestPasswordHashCorrect(t *testing.T) {
	hash, err := auth.HashPassword("password")
	require.NoError(t, err)

	match, err := auth.CheckPasswordHash("password", hash)
	require.NoError(t, err)
	assert.True(t, match)
}

func TestPasswordHashIncorrect(t *testing.T) {
	hash, err := auth.HashPassword("password")
	require.NoError(t, err)

	match, err := auth.CheckPasswordHash("wrong-password", hash)
	require.NoError(t, err)
	assert.False(t, match)
}

func TestMakeJWT(t *testing.T) {
	token, err := auth.MakeJWT(uuid.New(), "secret", time.Hour)
	require.NoError(t, err)
	assert.NotEmpty(t, token)
	assert.Len(t, strings.Split(token, "."), 3)
}

func TestValidateJWTValidToken(t *testing.T) {
	id := uuid.New()
	token, err := auth.MakeJWT(id, "secret", time.Hour)
	require.NoError(t, err)

	got, err := auth.ValidateJWT(token, "secret")
	require.NoError(t, err)
	assert.Equal(t, id, got)
}

func TestValidateJWTWrongSecret(t *testing.T) {
	token, err := auth.MakeJWT(uuid.New(), "correct-secret", time.Hour)
	require.NoError(t, err)

	_, err = auth.ValidateJWT(token, "wrong-secret")
	assert.Error(t, err)
}

func TestValidateJWTExpiredToken(t *testing.T) {
	token, err := auth.MakeJWT(uuid.New(), "secret", -time.Second)
	require.NoError(t, err)

	_, err = auth.ValidateJWT(token, "secret")
	assert.Error(t, err)
}

func TestValidateJWTMalformedToken(t *testing.T) {
	_, err := auth.ValidateJWT("not.a.token", "secret")
	assert.Error(t, err)
}

func TestValidateJWTEmptyToken(t *testing.T) {
	_, err := auth.ValidateJWT("", "secret")
	assert.Error(t, err)
}

func TestValidateJWTTamperedPayload(t *testing.T) {
	token, err := auth.MakeJWT(uuid.New(), "secret", time.Hour)
	require.NoError(t, err)

	parts := strings.Split(token, ".")
	require.Len(t, parts, 3)
	payload := []byte(parts[1])
	payload[0] ^= 0x01
	tampered := parts[0] + "." + string(payload) + "." + parts[2]

	_, err = auth.ValidateJWT(tampered, "secret")
	assert.Error(t, err)
}

func TestValidateJWTWrongSigningMethod(t *testing.T) {
	noneToken := "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0" +
		".eyJpc3MiOiJjaGVzc2dvIiwic3ViIjoiMDAwMDAwMDAtMDAwMC0wMDAwLTAwMDAtMDAwMDAwMDAwMDAwIn0."
	_, err := auth.ValidateJWT(noneToken, "secret")
	assert.Error(t, err)
}

func TestValidateJWTWrongIssuer(t *testing.T) {
	claims := &jwt.RegisteredClaims{
		Issuer:    "not-chessgo",
		Subject:   uuid.New().String(),
		IssuedAt:  jwt.NewNumericDate(time.Now().UTC()),
		ExpiresAt: jwt.NewNumericDate(time.Now().UTC().Add(time.Hour)),
	}
	tok := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := tok.SignedString([]byte("secret"))
	require.NoError(t, err)

	_, err = auth.ValidateJWT(signed, "secret")
	assert.Error(t, err)
}

func TestValidateJWTSubjectRoundTrips(t *testing.T) {
	id := uuid.MustParse("550e8400-e29b-41d4-a716-446655440000")
	token, err := auth.MakeJWT(id, "secret", time.Hour)
	require.NoError(t, err)

	got, err := auth.ValidateJWT(token, "secret")
	require.NoError(t, err)
	assert.Equal(t, id, got)
}

func TestMakeRefreshToken(t *testing.T) {
	token, err := auth.MakeRefreshToken()
	require.NoError(t, err)
	assert.NotEmpty(t, token)
	assert.Len(t, token, 64)

	for _, c := range token {
		assert.True(t,
			(c >= '0' && c <= '9') || (c >= 'a' && c <= 'f'),
			"character %q is not lowercase hex", c,
		)
	}
}
