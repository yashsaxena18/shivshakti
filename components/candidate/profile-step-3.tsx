//components/candidate/profile-step-3.tsx
import { SearchableSelect } from "@/components/ui/searchable-select";

type JobCategories = Record<string, string[]>;

type Props = {
  highestQualification: string;
  college: string;
  passingYear: string;
  skills: string;

  // First dropdown
  selectedJobField: string;

  // Second dropdown
  preferredJobField: string;

  experience: string;

  expIndustry: string;
  expJobProfile: string;
  expLocation: string;
  expQualification: string;
  expTotalYears: string;
  expPastSalary: string;
  expExpectedSalary: string;

  jobCategories: JobCategories;
  jobCategoryNames: string[];

  errors: Record<string, string>;

  onChange: (
    field:
      | "highestQualification"
      | "college"
      | "passingYear"
      | "skills"
      | "preferredJobField"
      | "experience"
      | "expIndustry"
      | "expJobProfile"
      | "expLocation"
      | "expQualification"
      | "expTotalYears"
      | "expPastSalary"
      | "expExpectedSalary",
    value: string
  ) => void;

  onJobFieldChange: (value: string) => void;
};

const experienceLevels = ["Fresher", "Experienced"];

export default function ProfileStep3({
  highestQualification,
  college,
  passingYear,
  skills,
  selectedJobField,
  preferredJobField,
  experience,
  expIndustry,
  expJobProfile,
  expLocation,
  expQualification,
  expTotalYears,
  expPastSalary,
  expExpectedSalary,
  jobCategories,
  jobCategoryNames,
  onChange,
  onJobFieldChange,
  errors,
}: Props) {
  const availableJobs =
    selectedJobField && jobCategories[selectedJobField]
      ? jobCategories[selectedJobField]
      : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Professional Details
        </h2>

        <p className="mt-2 text-zinc-500">
          Tell recruiters about your education, skills and career interests.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">

        {/* Highest Qualification */}
        <div>
          <label className="mb-2 block text-sm font-semibold">
            Highest Qualification
          </label>

          <input
            value={highestQualification}
            onChange={(e) =>
              onChange("highestQualification", e.target.value)
            }
            placeholder="Highest Qualification"
            className={`h-11 w-full rounded-xl border bg-white px-3 transition-all duration-200 focus:outline-none dark:bg-zinc-900 ${
              errors.highestQualification
                ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                : "border-zinc-300 focus:border-black focus:ring-2 focus:ring-zinc-300 dark:border-zinc-700"
            }`}
          />

          {errors.highestQualification && (
            <p className="mt-1 text-sm text-red-500">
              {errors.highestQualification}
            </p>
          )}
        </div>

        {/* Passing Year */}
        <div>
          <label className="mb-2 block text-sm font-semibold">
            Passing Year
          </label>

          <input
            value={passingYear}
            onChange={(e) =>
              onChange("passingYear", e.target.value)
            }
            placeholder="Passing Year"
            className={`h-11 w-full rounded-xl border bg-white px-3 transition-all duration-200 focus:outline-none dark:bg-zinc-900 ${
              errors.passingYear
                ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                : "border-zinc-300 focus:border-black focus:ring-2 focus:ring-zinc-300 dark:border-zinc-700"
            }`}
          />

          {errors.passingYear && (
            <p className="mt-1 text-sm text-red-500">
              {errors.passingYear}
            </p>
          )}
        </div>

        {/* College */}
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-semibold">
            College / University
          </label>

          <input
            value={college}
            onChange={(e) =>
              onChange("college", e.target.value)
            }
            placeholder="College / University"
            className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 transition-all duration-200 focus:border-black focus:ring-2 focus:ring-zinc-300 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>

        {/* Skills */}
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-semibold">
            Skills
          </label>

          <input
            value={skills}
            onChange={(e) =>
              onChange("skills", e.target.value)
            }
            placeholder="React, SQL, Java..."
            className={`h-11 w-full rounded-xl border bg-white px-3 transition-all duration-200 focus:outline-none dark:bg-zinc-900 ${
              errors.skills
                ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                : "border-zinc-300 focus:border-black focus:ring-2 focus:ring-zinc-300 dark:border-zinc-700"
            }`}
          />

          {errors.skills && (
            <p className="mt-1 text-sm text-red-500">
              {errors.skills}
            </p>
          )}
        </div>

        {/* Job Field - Searchable Dropdown */}
        <SearchableSelect
          id="job-field"
          label="Job Field"
          required
          value={selectedJobField}
          onChange={(val) => onJobFieldChange(val)}
          options={jobCategoryNames}
          placeholder="Select or search Job Field..."
          searchPlaceholder="Type to search Job Field (e.g. Pharma, IT, Accounts)..."
          error={errors.selectedJobField}
          emptyMessage="No job fields found matching your search"
        />

        {/* Preferred Job - Searchable Dropdown */}
        <SearchableSelect
          id="preferred-job-field"
          label="Preferred Job"
          required
          value={preferredJobField}
          onChange={(val) => onChange("preferredJobField", val)}
          options={availableJobs}
          placeholder={
            selectedJobField
              ? "Select or search Preferred Job..."
              : "First select a Job Field"
          }
          searchPlaceholder="Type to search Preferred Job (e.g. Manager, Chemist, Operator)..."
          disabled={!selectedJobField}
          disabledMessage="Please choose a Job Field first to see relevant job roles"
          error={errors.preferredJobField}
          emptyMessage="No preferred jobs found matching your search"
        />

        {/* Experience */}
        <div>
          <label className="mb-2 block text-sm font-semibold">
            Experience
          </label>

          <select
            value={experience}
            onChange={(e) =>
              onChange("experience", e.target.value)
            }
            className={`h-11 w-full rounded-xl border bg-white px-3 transition-all duration-200 focus:outline-none dark:bg-zinc-900 ${
              errors.experience
                ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                : "border-zinc-300 focus:border-black focus:ring-2 focus:ring-zinc-300 dark:border-zinc-700"
            }`}
          >
            <option value="">
              Select Experience
            </option>

            {experienceLevels.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          {errors.experience && (
            <p className="mt-1 text-sm text-red-500">
              {errors.experience}
            </p>
          )}
        </div>

      </div>

      {/* Conditional Fields for Experienced Candidates */}
      {experience === "Experienced" && (
        <div className="mt-6 border-t border-zinc-200 pt-6 dark:border-zinc-800">
          <h3 className="mb-4 text-lg font-bold">Experience Details</h3>
          <div className="grid gap-5 md:grid-cols-2">
            
            {/* Industry */}
            <div>
              <label className="mb-2 block text-sm font-semibold">Industry</label>
              <input
                value={expIndustry}
                onChange={(e) => onChange("expIndustry", e.target.value)}
                placeholder="E.g. IT, Healthcare"
                className={`h-11 w-full rounded-xl border bg-white px-3 transition-all duration-200 focus:outline-none dark:bg-zinc-900 ${
                  errors.expIndustry
                    ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                    : "border-zinc-300 focus:border-black focus:ring-2 focus:ring-zinc-300 dark:border-zinc-700"
                }`}
              />
              {errors.expIndustry && <p className="mt-1 text-sm text-red-500">{errors.expIndustry}</p>}
            </div>

            {/* Job Profile */}
            <div>
              <label className="mb-2 block text-sm font-semibold">Job Profile</label>
              <input
                value={expJobProfile}
                onChange={(e) => onChange("expJobProfile", e.target.value)}
                placeholder="E.g. Software Engineer"
                className={`h-11 w-full rounded-xl border bg-white px-3 transition-all duration-200 focus:outline-none dark:bg-zinc-900 ${
                  errors.expJobProfile
                    ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                    : "border-zinc-300 focus:border-black focus:ring-2 focus:ring-zinc-300 dark:border-zinc-700"
                }`}
              />
              {errors.expJobProfile && <p className="mt-1 text-sm text-red-500">{errors.expJobProfile}</p>}
            </div>

            {/* Location */}
            <div>
              <label className="mb-2 block text-sm font-semibold">Location</label>
              <input
                value={expLocation}
                onChange={(e) => onChange("expLocation", e.target.value)}
                placeholder="E.g. Mumbai, Pune"
                className={`h-11 w-full rounded-xl border bg-white px-3 transition-all duration-200 focus:outline-none dark:bg-zinc-900 ${
                  errors.expLocation
                    ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                    : "border-zinc-300 focus:border-black focus:ring-2 focus:ring-zinc-300 dark:border-zinc-700"
                }`}
              />
              {errors.expLocation && <p className="mt-1 text-sm text-red-500">{errors.expLocation}</p>}
            </div>

            {/* Qualification */}
            <div>
              <label className="mb-2 block text-sm font-semibold">Qualification</label>
              <input
                value={expQualification}
                onChange={(e) => onChange("expQualification", e.target.value)}
                placeholder="E.g. B.Tech, MBA"
                className={`h-11 w-full rounded-xl border bg-white px-3 transition-all duration-200 focus:outline-none dark:bg-zinc-900 ${
                  errors.expQualification
                    ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                    : "border-zinc-300 focus:border-black focus:ring-2 focus:ring-zinc-300 dark:border-zinc-700"
                }`}
              />
              {errors.expQualification && <p className="mt-1 text-sm text-red-500">{errors.expQualification}</p>}
            </div>

            {/* Total Experience */}
            <div>
              <label className="mb-2 block text-sm font-semibold">Experience (Total Years)</label>
              <input
                value={expTotalYears}
                onChange={(e) => onChange("expTotalYears", e.target.value)}
                placeholder="E.g. 5 Years"
                className={`h-11 w-full rounded-xl border bg-white px-3 transition-all duration-200 focus:outline-none dark:bg-zinc-900 ${
                  errors.expTotalYears
                    ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                    : "border-zinc-300 focus:border-black focus:ring-2 focus:ring-zinc-300 dark:border-zinc-700"
                }`}
              />
              {errors.expTotalYears && <p className="mt-1 text-sm text-red-500">{errors.expTotalYears}</p>}
            </div>

            {/* Past Salary */}
            <div>
              <label className="mb-2 block text-sm font-semibold">Past Salary (Per Month)</label>
              <input
                value={expPastSalary}
                onChange={(e) => onChange("expPastSalary", e.target.value)}
                placeholder="E.g. 50,000"
                className={`h-11 w-full rounded-xl border bg-white px-3 transition-all duration-200 focus:outline-none dark:bg-zinc-900 ${
                  errors.expPastSalary
                    ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                    : "border-zinc-300 focus:border-black focus:ring-2 focus:ring-zinc-300 dark:border-zinc-700"
                }`}
              />
              {errors.expPastSalary && <p className="mt-1 text-sm text-red-500">{errors.expPastSalary}</p>}
            </div>

            {/* Expected Salary */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold">Expected Salary (Per Month)</label>
              <input
                value={expExpectedSalary}
                onChange={(e) => onChange("expExpectedSalary", e.target.value)}
                placeholder="E.g. 60,000"
                className={`h-11 w-full rounded-xl border bg-white px-3 transition-all duration-200 focus:outline-none dark:bg-zinc-900 ${
                  errors.expExpectedSalary
                    ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                    : "border-zinc-300 focus:border-black focus:ring-2 focus:ring-zinc-300 dark:border-zinc-700"
                }`}
              />
              {errors.expExpectedSalary && <p className="mt-1 text-sm text-red-500">{errors.expExpectedSalary}</p>}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}