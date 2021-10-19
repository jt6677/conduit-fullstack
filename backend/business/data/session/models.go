package session

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"time"
)

//SessionInfo struct
type SessionInfo struct {
	ID       int      `db:"session_id" json:"id"`
	UserID   int      `db:"user_id" json:"user_id" `
	DateID   int      `db:"date_id" json:"date_id" `
	Started  NullTime `db:"started,omitempty" json:"started,omitempty"`
	Finished NullTime `db:"finished,omitempty" json:"finished,omitempty"`
}

// NullInt64 is an alias for sql.NullInt64 data type
type NullInt32 struct {
	sql.NullInt32
}

// MarshalJSON for NullInt64
func (ni *NullInt32) MarshalJSON() ([]byte, error) {
	if !ni.Valid {
		return []byte("null"), nil
	}
	return json.Marshal(ni.Int32)
}

// UnmarshalJSON for NullInt64
func (ni *NullInt32) UnmarshalJSON(b []byte) error {
	err := json.Unmarshal(b, &ni.Int32)
	ni.Valid = (err == nil)
	return err
}

// NullString is an alias for sql.NullString data type
type NullString struct {
	sql.NullString
}

// MarshalJSON for NullString
func (ns *NullString) MarshalJSON() ([]byte, error) {
	if !ns.Valid {
		return []byte("null"), nil
	}
	return json.Marshal(ns.String)
}

// UnmarshalJSON for NullString
func (ns *NullString) UnmarshalJSON(b []byte) error {
	err := json.Unmarshal(b, &ns.String)
	ns.Valid = (err == nil)
	return err
}

// NullTime is an alias for mysql.NullTime data type
type NullTime struct {
	sql.NullTime
}

// MarshalJSON for NullTime
func (nt *NullTime) MarshalJSON() ([]byte, error) {
	if !nt.Valid {
		return []byte("null"), nil
	}
	val := fmt.Sprintf("\"%s\"", nt.Time.Format(time.RFC3339))
	return []byte(val), nil
}

// UnmarshalJSON for NullTime
func (nt *NullTime) UnmarshalJSON(b []byte) error {
	err := json.Unmarshal(b, &nt.Time)
	nt.Valid = (err == nil)
	return err
}
