import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction"; // Needed for interactions
import * as bootstrap from "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Calendar.css";

function Calendar() {
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({ title: "", start: "", color: "#378006" });
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false); // State for edit mode
  const [currentEvent, setCurrentEvent] = useState(null); // State to hold the current event being edited

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent((prev) => ({ ...prev, [name]: value }));
  };

  const addEvent = (e) => {
    e.preventDefault();
    if (newEvent.title && newEvent.start) {
      if (editMode) {
        // Update existing event
        setEvents((prevEvents) =>
          prevEvents.map((event) =>
            event.title === currentEvent.title ? { ...event, ...newEvent } : event
          )
        );
      } else {
        // Add new event
        setEvents((prevEvents) => [
          ...prevEvents,
          { title: newEvent.title, start: newEvent.start, color: newEvent.color || null },
        ]);
      }
      resetForm();
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
    setEditMode(true); // Set to edit mode
    setShowModal(true); // Show modal to edit event
  };

  const deleteEvent = () => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      setEvents((prevEvents) => prevEvents.filter((event) => event.title !== currentEvent.title));
      resetForm(); // Reset form after deletion
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
        eventClick={handleEventClick} // Handle click on events
        eventDidMount={(info) => {
          return new bootstrap.Popover(info.el, {
            title: info.event.title,
            placement: "auto",
            trigger: "hover",
            customClass: "popoverStyle",
            content:
              "<p>Tiny box in <strong>Bootstrap</strong>.</p>",
            html: true,
          });
        }}
        customButtons={{
          addEventButton: {
            text: 'Add Event',
            click: () => setShowModal(true),
          },
        }}
      />

      {/* Modal for adding/updating events */}
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