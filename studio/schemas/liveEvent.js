export default {
      name: 'liveEvent',
      title: 'Live Event',
      type: 'document',
      fields: [
            {
                  name: 'title',
                  title: 'Title',
                  type: 'string',
                  validation: Rule => Rule.required()
            },
            {
                  name: 'description',
                  title: 'Description',
                  type: 'text',
                  rows: 3
            },
            {
                  name: 'date',
                  title: 'Event Date',
                  type: 'datetime',
                  description: 'When the live event starts',
                  validation: Rule => Rule.required()
            },
            {
                  name: 'youtubeId',
                  title: 'YouTube Video ID',
                  type: 'string',
                  description: 'The YouTube Live video ID (e.g., dQw4w9WgXcQ)'
            },
            {
                  name: 'isActive',
                  title: 'Is Live Now?',
                  type: 'boolean',
                  description: 'Toggle ON when the stream is live',
                  initialValue: false
            },
            {
                  name: 'thumbnail',
                  title: 'Thumbnail',
                  type: 'image',
                  options: {
                        hotspot: true
                  },
                  description: 'Preview image shown before the event'
            }
      ],
      preview: {
            select: {
                  title: 'title',
                  date: 'date',
                  isActive: 'isActive',
                  media: 'thumbnail'
            },
            prepare({ title, date, isActive, media }) {
                  const status = isActive ? '🔴 LIVE' : '⏰ Upcoming';
                  const formattedDate = date ? new Date(date).toLocaleDateString() : 'No date';
                  return {
                        title: `${status} ${title}`,
                        subtitle: formattedDate,
                        media
                  };
            }
      }
};
