type StudentPropsT = {
  name: string;
  description: string;
  avatarUrl?: string;
};

export const StudentCell = ({ name, description, avatarUrl }: StudentPropsT) => {
  return (
    <div className="flex items-center gap-2">
      {avatarUrl && <img src={avatarUrl} alt={name} />}
      <div>
        <div>{name}</div>
        <div>{description}</div>
      </div>
    </div>
  );
};
