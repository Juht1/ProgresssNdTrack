import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction"; 
import * as bootstrap from "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Calendar.css";

function Calendar() {
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({ title: "", start: "", color: "#378006" });
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [emailRecipients, setEmailRecipients] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch("http://localhost:5000/events");
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmailRecipientChange = (e) => {
    if (e.key !== "Enter") return;
    const { value } = e.target;
    setEmailRecipients([...emailRecipients, value]);
    e.target.value = "";
  };

  const addEvent = async (e) => {
    e.preventDefault();
    newEvent.emailRecipients = emailRecipients;

    if (newEvent.title && newEvent.start) {
      try {
        await fetch("http://localhost:5000/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newEvent),
        });
        fetchEvents();
        resetForm();
      } catch (error) {
        console.error("Error adding/updating event:", error);
      }
    } else {
      alert("Please fill in all required fields.");
    }
  };

  const resetForm = () => {
    setNewEvent({ title: "", start: "", color: "#378006" });
    setShowModal(false);
    setEditMode(false);
    setCurrentEvent(null);
  };

  const handleEventClick = (info) => {
    setCurrentEvent(info.event);
    setNewEvent({
      title: info.event.title,
      start: info.event.startStr,
      color: info.event.backgroundColor,
    });
    setEditMode(true);
    setShowModal(true);
  };

  const deleteEvent = async () => {
    if (window.confirm("Are you sure you want to delete this event?")) {
        try {
            const response = await fetch(`http://localhost:5000/events/${currentEvent.title}`, { method: "DELETE" });

            if (!response.ok) {
                if (response.status === 404) {
                    alert("Event not found.");
                } else {
                    alert("Failed to delete event.");
                }
                return;
            }

            fetchEvents(); 
            resetForm();
        } catch (error) {
            console.error("Error deleting event:", error);
            alert("An error occurred while trying to delete the event.");
        }
    }
};


  return (
    <div>
      <h2>Calendar</h2>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={"dayGridMonth"}
        headerToolbar={{
          start: "today prev,next",
          center: "title",
          end: "addEventButton,dayGridMonth,timeGridWeek,timeGridDay",
        }}
        height={"90vh"}
        events={events}
        eventClick={handleEventClick}
        customButtons={{
          addEventButton: {
            text: 'Add Event',
            click: () => setShowModal(true),
          },
        }}
      />

      <div className={`modal ${showModal ? 'show' : ''}`} style={{ display: showModal ? 'block' : 'none' }} tabIndex="-1" role="dialog">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{editMode ? "Edit Event" : "Add Event"}</h5>
              <button type="button" className="close" onClick={resetForm}>
                <span>&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={addEvent}>
                <div className="mb-3">
                  <label className="form-label">Event Title</label>
                  <input
                    type="text"
                    name="title"
                    value={newEvent.title}
                    onChange={handleInputChange}
                    className="form-control"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    name="start"
                    value={newEvent.start}
                    onChange={handleInputChange}
                    className="form-control"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Select Color</label>
                  <input
                    type="color"
                    name="color"
                    value={newEvent.color}
                    onChange={handleInputChange}
                    className="form-control"
                  />
                </div>
                <div className="mb-3">
                  <p>{emailRecipients.map(er => er).join(", ")}</p>
                  <label className="form-label">Add email recipient</label>
                  <input
                    type="text"
                    name="title"
                    onKeyDown={handleEmailRecipientChange}
                    className="form-control"
                  />
                </div>
                <button type="submit" className="btn btn-primary">{editMode ? "Update" : "Submit"}</button>
                {editMode && (
                  <button type="button" className="btn btn-danger ms-2" onClick={deleteEvent}>
                    Delete Event
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>

      {showModal && <div className="modal-backdrop fade show"></div>}
    </div>
  );
}

export default Calendar;
